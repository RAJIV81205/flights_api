# Backend Flight Booking System

This is a simple backend application for a flight booking system, built with Node.js and Express. It uses in-memory data storage and JWT for authentication. This project covers essential features for user management, flight listing, and booking.

## Table of Contents

- [Features](#features)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Flights](#flights)
  - [Bookings](#bookings)
- [Data Structures](#data-structures)

## Features

- User Signup & Login with JWT authentication.
- Listing of available flights with pagination and search capabilities.
- Booking flights (authenticated).
- Cancelling flight bookings (authenticated).
- Viewing user-specific booking history (authenticated).
- In-memory data storage (no database required).

## Setup

To get the project up and running on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/RAJIV81205/flights_api.git
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the application:**

    ```bash
    node index.js
    ```

The server will start on `http://localhost:3000` 

## API Endpoints

All API endpoints return JSON responses and appropriate HTTP status codes.

### Authentication

-   **POST /users/signup**
    -   **Description:** Registers a new user.
    -   **Request Body:**
        ```json
        {
          "name": "string",
          "email": "string",
          "password": "string"
        }
        ```
    -   **Success Response (200 OK):**
        ```json
        {
          "token": "<JWT_TOKEN>",
          "userId": "<USER_ID>"
        }
        ```
    -   **Error Responses:**
        -   `400 Bad Request`: Missing fields or user already exists.

-   **POST /users/login**
    -   **Description:** Authenticates a user and returns a JWT token.
    -   **Request Body:**
        ```json
        {
          "email": "string",
          "password": "string"
        }
        ```
    -   **Success Response (200 OK):**
        ```json
        {
          "token": "<JWT_TOKEN>",
          "userId": "<USER_ID>"
        }
        ```
    -   **Error Responses:**
        -   `400 Bad Request`: Missing fields or invalid credentials.

### Flights

-   **GET /flights**
    -   **Description:** Returns a list of available flights.
    -   **Query Parameters (Optional):**
        -   `page`: (number) For pagination, specify the page number (default: 1).
        -   `limit`: (number) For pagination, specify the number of flights per page (default: all flights).
        -   `origin`: (string) Filter flights by origin city code (e.g., "BLR").
        -   `destination`: (string) Filter flights by destination city code (e.g., "DEL").
    -   **Success Response (200 OK):**
        ```json
        {
          "total": 5,
          "page": 1,
          "limit": 5,
          "flights": [
            {
              "id": 1,
              "airline": "IndiGo",
              "origin": "BLR",
              "destination": "DEL",
              "departureTime": "2025-08-28T10:00",
              "availableSeats": 4
            }
          ]
        }
        ```

### Bookings

-   **POST /bookings**
    -   **Description:** Books a seat on a flight for an authenticated user. Requires a valid JWT token in the `Authorization` header (`Bearer <token>`).
    -   **Request Body:**
        ```json
        {
          "userId": "number",
          "flightId": "number"
        }
        ```
    -   **Success Response (200 OK):**
        ```json
        {
          "message": "Flight booked successfully",
          "booking": {
            "id": "number",
            "userId": "number",
            "flightId": "number",
            "status": "booked"
          }
        }
        ```
    -   **Error Responses:**
        -   `400 Bad Request`: Missing `userId` or `flightId`, or no seats available.
        -   `401 Unauthorized`: No or invalid token.
        -   `404 Not Found`: Invalid `flightId`.

-   **POST /bookings/:id/cancel**
    -   **Description:** Cancels an existing booking. Requires a valid JWT token in the `Authorization` header (`Bearer <token>`).
    -   **URL Parameters:**
        -   `id`: (number) The ID of the booking to cancel.
    -   **Success Response (200 OK):**
        ```json
        {
          "message": "Booking cancelled successfully",
          "booking": {
            "id": "number",
            "userId": "number",
            "flightId": "number",
            "status": "cancelled"
          }
        }
        ```
    -   **Error Responses:**
        -   `400 Bad Request`: Booking already cancelled.
        -   `401 Unauthorized`: No/invalid token or not authorized to cancel this booking.
        -   `404 Not Found`: Booking not found.

-   **GET /bookings/:userId**
    -   **Description:** Lists all bookings (booked/cancelled) for a specific user. Requires a valid JWT token in the `Authorization` header (`Bearer <token>`). The `userId` in the URL must match the authenticated user's ID.
    -   **URL Parameters:**
        -   `userId`: (number) The ID of the user whose bookings are to be retrieved.
    -   **Success Response (200 OK):**
        ```json
        [
          {
            "id": "number",
            "userId": "number",
            "flightId": "number",
            "status": "booked" || "cancelled"
          }
        ]
        ```
    -   **Error Responses:**
        -   `401 Unauthorized`: No/invalid token or not authorized to view these bookings.

## Data Structures

The application uses in-memory arrays for storing data:

-   `users`: Stores user objects `{ id, name, email, password (hashed) }`.
-   `flights`: Stores flight objects (defined in `flightData.js`).
-   `bookings`: Stores booking objects `{ id, userId, flightId, status }`.


