# Library Books REST API Design

## Endpoints

- **List all books**
  - Method: GET
  - Path: `/api/v1/books`
  - Description: Retrieves a list of all books in the library catalogue.
  - Success Status Code: 200 OK

- **List books by author**
  - Method: GET
  - Path: `/api/v1/books?author={authorName}`
  - Description: Filters and returns a list of books written by a specific author.
  - Success Status Code: 200 OK

- **Get a single book**
  - Method: GET
  - Path: `/api/v1/books/{id}`
  - Description: Retrieves detailed information about a specific book by ID.
  - Success Status Code: 200 OK

- **Create a new book**
  - Method: POST
  - Path: `/api/v1/books`
  - Description: Adds a new book entry to the library catalogue.
  - Request Body Example:
    ```json
    {
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "9780061120084",
      "publishedYear": 1960
    }
    ```
  - Success Status Code: 201 Created

- **Update an existing book**
  - Method: PUT
  - Path: `/api/v1/books/{id}`
  - Description: Updates all information for an existing book matching the ID.
  - Request Body Example:
    ```json
    {
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "9780061120084",
      "publishedYear": 1960,
      "available": false
    }
    ```
  - Success Status Code: 200 OK

- **Delete a book**
  - Method: DELETE
  - Path: `/api/v1/books/{id}`
  - Description: Removes a book record permanently from the library.
  - Success Status Code: 200 OK

---

## Error Handling

- **Status Code 400 Bad Request**
  - Happens when the client submits invalid or missing data in a request payload (e.g., attempting to create a book without a title or with invalid JSON data).

- **Status Code 404 Not Found**
  - Happens when requesting a resource URL that does not exist or querying a book ID that is not present in the database (e.g., GET `/api/v1/books/999999`).
