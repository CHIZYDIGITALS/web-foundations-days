# TicketHub Design Document

## 1. Requirements

### Functional Requirements

- **Event Browsing & Search**: Users can view lists of upcoming concerts and events, filtered by category, date, or popularity.
- **Seat Map & Selection**: Users can view real-time seat maps for venues and select specific available seats.
- **Temporary Seat Hold**: Selected seats are temporarily locked for a short duration (e.g., 10 minutes) while the user completes checkout to prevent race conditions.
- **Payment Processing**: Users can securely submit payment information to finalize ticket purchases.
- **Order History**: Users can view their confirmed tickets and order details.

### Non-Functional Requirements

- **Speed**: Fast page load times and sub-500ms API response latency during standard browsing.
- **Correctness (Zero Double-Booking)**: Strict transactional integrity ensuring no two users can ever purchase or lock the exact same seat.
- **Fairness**: First-come, first-served queueing mechanism during high-traffic flash sales to prevent bots from crashing the system or hoarding seats.

---

## 2. Traffic Estimates (Normal Day vs. Big Sale Peak)

### Normal Traffic

- **Registered Users**: 2,000,000 users.
- **Daily Visitors**: 50,000 people visit on a normal day.
- **Page Views**: 50,000 visitors $\times$ 10 pages/day = 500,000 page views/day.
- **Tickets Sold**: 5,000 tickets sold on a normal day.

### Popular Concert Flash Sale Peak

- **Traffic Surge**: 200,000 users flood the system trying to buy tickets for a high-demand concert.
- **Inventory**: 20,000 seats available.
- **Timeframe**: All requests arrive within the first 10 minutes.
- **Comparison**: Peak concurrency jumps exponentially, multiplying normal write throughput and seat locks by a factor of 40x within minutes, requiring an isolated queueing and caching layer to protect the primary database.

---

## 3. API Design

| Method   | Path                         | Description                                       | Success Status Code |
| :------- | :--------------------------- | :------------------------------------------------ | :------------------ |
| **GET**  | `/api/v1/events`             | List all available concerts and events            | `200 OK`            |
| **GET**  | `/api/v1/events/{id}/seats`  | Retrieve real-time seat availability for an event | `200 OK`            |
| **POST** | `/api/v1/tickets/hold`       | Temporarily hold selected seats for checkout      | `201 Created`       |
| **POST** | `/api/v1/orders`             | Process payment and finalize ticket purchase      | `201 Created`       |
| **GET**  | `/api/v1/users/{id}/tickets` | Retrieve all purchased tickets for a user         | `200 OK`            |

---

## 4. Data Model

### Entities and Tables

1. **`users`**: Stores user credentials and profile information.
   - `id` (UUID, Primary Key), `email`, `password_hash`, `created_at`.
2. **`events`**: Stores concert and venue details.
   - `id` (UUID, Primary Key), `title`, `description`, `event_date`, `total_seats`.
3. **`seats`**: Stores individual seats linked to events and their status (`available`, `held`, `sold`).
   - `id` (UUID, Primary Key), `event_id` (Foreign Key), `seat_number`, `status`.
4. **`orders`**: Stores completed payment and transaction records.
   - `id` (UUID, Primary Key), `user_id` (Foreign Key), `total_amount`, `status`, `created_at`.

---

## 5. Preventing Double-Booking

To guarantee that two users can never purchase the same seat, TicketHub uses a two-tier approach:

1. **Redis Distributed Locks / TTL Holds**: When a user selects a seat, a temporary hold with a 10-minute expiration is placed in Redis. If the user does not complete payment within 10 minutes, the lock expires automatically.
2. **Database Row-Level Locking (`SELECT ... FOR UPDATE`)**: During checkout finalization, the database transaction locks the specific seat row using `SELECT * FROM seats WHERE id = $1 FOR UPDATE`. This ensures serial execution for conflicting purchase attempts, instantly rejecting any second transaction if the seat status has changed from `held` to `sold`.

---

## 6. Architecture Diagram and Scaling Strategy

```text
[ Client Browsers / Mobile Apps ]
               │
               ▼
   [ Cloudflare CDN & WAF ] (Bot Protection & Rate Limiting)
               │
               ▼
     [ Application Load Balancer ]
               ┌──────────────┴──────────────┐
               ▼                             ▼
       [ App Server 1 ]              [ App Server 2 ]
               │                             │
               ├─────────────────────────────┤
               ▼                             ▼
     [ Redis (Seat Holds / Caching) ]  [ RabbitMQ / Message Queue ]
               │                             │
               ▼                             ▼
     [ Primary PostgreSQL ] ──(Replicas)──► [ Read Replicas ]
How it survives the big sale: The CDN absorbs static asset traffic, while a rate-limiting WAF blocks malicious bots. Incoming purchase requests hit an application load balancer, which distributes traffic across stateless app servers. Redis handles high-speed temporary seat reservations in-memory without hammering the database, while the message queue asynchronously processes payment confirmations.
7. Trade-offs
Strong Consistency vs. Availability for Seat Selection: We prioritized strict transactional consistency (preventing double-booking at all costs) over raw availability. If the primary database experiences heavy contention, users may experience a brief queue wait rather than risking a sold-seat collision.
Asynchronous Order Processing: Using a message queue for order confirmation means users see a "processing order" status rather than instant synchronous confirmation, but it protects the system from crashing during massive traffic spikes.
---
```
