# Backend

Express API for the car rental app. Run commands from this directory unless noted.

## Setup

1. Copy `.env.example` to `.env` and set the MySQL credentials and a private `JWT_SECRET`.
2. Install dependencies with `npm install`.
3. Create the schema and starter records with `npm run setup-db`.
4. Start the API with `npm start`.

The API listens on port 3000 by default. Routes are grouped under `routes/`; `/api` is the standard prefix. The original short paths (`/cars`, `/auth`, `/bookings`, `/feedback`, and `/health`) remain available for existing clients.

## Layout

- `config/` ? environment and database configuration
- `middleware/` ? authentication and authorization
- `routes/` ? health, authentication, cars, bookings, and feedback endpoints
- `utils/` ? shared request and response helpers
- `db-schema.sql` ? database schema reference
- `setup-db.js` ? database and starter data setup
- `verify-admin.js`, `reset-admin-password.js` ? local admin account utilities
