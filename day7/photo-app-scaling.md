# SnapShare - System Scaling Plan

## 1. Assumptions

- **Registered Users:** 10,000,000
- **Daily Active Users (DAU):** 10% of registered users = 1,000,000 active users per day
- **User Activity:** Each active user uploads 1 photo per day and views 50 feed pages per day.
- **File Sizes:** Average photo = 2 MB; Thumbnail = 50 KB.
- **Traffic Distribution:** Peak traffic multiplier is 5× the average rate.
- **Time Conversion:** 1 day = 86,400 seconds.

---

## 2. Quantitative Estimates

- **Daily Active Users (DAU):**
  $$10,000,000 \times 0.10 = 1,000,000 \text{ users/day}$$
- **Uploads Per Second:**
  - Average: $1,000,000 \text{ uploads} / 86,400\text{s} \approx 11.57 \text{ uploads/sec}$
  - Peak ($5\times$): $\approx 57.85 \text{ uploads/sec}$
- **Feed Views Per Second:**
  - Average: $(1,000,000 \text{ users} \times 50 \text{ views}) / 86,400\text{s} \approx 578.70 \text{ views/sec}$
  - Peak ($5\times$): $\approx 2,893.5 \text{ views/sec}$
- **Storage Per Year:**
  - **Photos:** $1,000,000 \text{ photos/day} \times 365 \text{ days} \times 2 \text{ MB} = 730,000,000 \text{ MB/year} \approx 730 \text{ TB/year}$
  - **Thumbnails:** $1,000,000 \times 365 \times 0.05 \text{ MB} = 18,250,000 \text{ MB/year} \approx 18.25 \text{ TB/year}$
  - **Total Storage:** $\approx 748.25 \text{ TB/year}$

---

## 3. Read-Heavy vs. Write-Heavy Analysis

- **Classification:** Read-heavy system.
- **Explanation:** With 50,000,000 feed views per day versus only 1,000,000 photo uploads per day, read requests vastly outnumber write requests (a 50:1 ratio). This means our design must prioritize fast content delivery through aggressive caching, Content Delivery Networks (CDNs), and database read replicas to handle high read concurrency without slowing down.

---

## 4. Database Storage Strategy

- **Decision:** Raw photo files and thumbnails should **not** be stored inside the relational database.
- **Alternative:** Photos are stored in **Object Storage** (e.g., AWS S3), while the database only stores lightweight metadata (such as photo URLs, user IDs, timestamps, and captions). Storing heavy binary files in a database causes slow queries, rapid database bloat, and costly scaling.

---

## 5. Architecture Diagram

```text
[ Client (App/Browser) ]
         │
         ▼
    [ CDN / Edge ] ─── (Serves cached photos & static assets)
         │
         ▼
[ Load Balancer (LB) ]
         │
         ├──────────────────────────────┐
         ▼                              ▼
  [ App Server 1 ]               [ App Server 2 ]
         │                              │
         ├──────────┬───────────────────┴───┬──────────────┐
         ▼          ▼                       ▼              ▼
    [ Cache ]  [ Primary DB ] ──(Sync)──> [Read Replica] [ Object Storage ]
                (Writes)                   (Reads)      (Raw Photos)
                                            │
                                            ▼
                                    [ Message Queue ]
                                            │
                                            ▼
                                    [ Thumbnail Worker ]
6. Component Breakdown (One Sentence Each)
CDN (Content Delivery Network): Caches and delivers static photo assets globally from edge locations closest to the user to reduce latency and server load.
Load Balancer: Distributes incoming user traffic evenly across multiple application servers to ensure high availability and prevent overload.
App Servers: Stateless servers that handle incoming HTTP requests, business logic, authentication, and coordinate API responses.
Cache (Redis/Memcached): Stores frequently accessed data (like user feeds and sessions) in memory for ultra-low latency lookups.
Primary Database: Handles all write operations (inserts, updates) and synchronizes data changes down to read replicas.
Database Read Replica: Handles heavy read traffic for feeds and user profiles to offload read queries from the primary database.
Object Storage: Provides scalable, durable cloud storage specifically optimized to hold raw binary media files like high-resolution user photos.
Message Queue: Asynchronously decouples upload tasks so background workers can process intensive jobs without blocking user requests.
Thumbnail Worker: Background service that polls the queue to automatically generate and compress smaller 50 KB thumbnail versions of uploaded photos.
7. Step-by-Step Upload Flow
Initiation: The client sends an upload request containing the photo binary to the Load Balancer.
Routing: The Load Balancer forwards the request to an available App Server.
Media Storage: The App Server uploads the raw photo file directly into Object Storage and receives a secure file URL.
Metadata Persistence: The App Server saves the photo metadata (URL, caption, user ID) into the Primary Database.
Async Queue Dispatch: The App Server pushes an event message containing the photo reference to the Message Queue.
Thumbnail Generation: A background Thumbnail Worker picks up the job from the queue, pulls the raw image from Object Storage, generates a 50 KB thumbnail, and saves it back to Object Storage.
Completion: The App Server returns a success response to the client indicating the upload is complete.
8. Trade-Offs
Consistency vs. Availability (Eventual Consistency for Feeds): Instead of forcing immediate global feed updates across all database read replicas upon upload, we accept a brief delay (eventual consistency) in exchange for faster feed loading speeds and higher system availability.
Storage Cost vs. User Experience (Dual File Storage): Storing both the original 2 MB photo and a 50 KB thumbnail increases annual storage consumption (~748 TB/year), but it drastically optimizes mobile network bandwidth and eliminates UI lagging when rendering grid-based feeds.
```
