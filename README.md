# Lead Distribution Platform

This is a full-stack MERN application designed to manage and distribute leads to a team of agents. It features a Node.js/Express backend, a React frontend, and MongoDB for data storage.

## Project Structure

```
/
├── client/         # React frontend application
│   ├── public/
│   └── src/
├── server/         # Node.js/Express backend API
│   ├── models/     # Mongoose data models
│   ├── middleware/ # Express middleware (e.g., auth)
│   ├── routes/     # API route definitions
│   ├── scripts/    # Utility scripts (e.g., DB seeding)
│   └── .env        # Environment variables (ignored by Git)
└── package.json    # Root package for running client & server concurrently
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB (local or remote instance)

### Installation & Setup

1.  **Clone the repository**

2.  **Configure Environment Variables:**
    - Navigate to the `server/` directory.
    - Create a `.env` file by copying the example: `cp .env.example .env`.
    - Edit the `.env` file and provide the necessary values, especially your `MONGO_URI`.

3.  **Install Dependencies:**
    - Install server-side dependencies:
      ```bash
      npm install --prefix server
      ```
    - Install client-side dependencies:
      ```bash
      npm install --prefix client
      ```

## Available Scripts

The project includes several npm scripts to streamline development, testing, and deployment.

### Root Directory

From the root directory, you can run both the client and server together.

-   `npm run dev`: Starts both the backend and frontend servers in development mode using `concurrently`. The backend runs with `nodemon` for automatic restarts.

### Server (`/server`)

-   `npm start`: Starts the server in production mode.
-   `npm run dev`: Starts the server with `nodemon` for development.
-   `npm run seed-admin`: Executes a script to seed the database with a default admin user based on credentials in your `.env` file.
-   `npm run check-env`: A utility script to check for the presence of required environment variables before starting the application.
-   `npm run build-client`: A helper script that navigates to the client directory and runs its build process.
-   `npm run start-prod`: Builds the client application and then starts the server. This is the primary command for running the application in a production-like environment.
-   `npm run lint`: Lints the server-side code using ESLint.
-   `npm run format`: Formats the server-side code using Prettier.

### Client (`/client`)

-   `npm start`: Starts the React development server.
-   `npm run build`: Bundles the React app for production.
-   `npm test`: Runs the test suite.
-   `npm run lint`: Lints the client-side code using ESLint.
-   `npm run format`: Formats the client-side code using Prettier.

## Seeding the Database

To create an initial admin user, you can use the seed script.

1.  Ensure your `MONGO_URI`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` are set in `server/.env`.
2.  From the `server/` directory, run:
    ```bash
    npm run seed-admin
    ```
This will connect to your database and create a new user with the provided credentials if one doesn't already exist.
