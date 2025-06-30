# Banking System API

A backend service for processing banking information, featuring a modular architecture with NestJS, TypeORM for data persistence, and Gremlin for graph-based relationship management.

---

## Core Concepts

- **Data Persistence**: Utilizes a PostgreSQL database managed by TypeORM, employing the repository pattern for clean data access.
- **Graph Relationships**: Manages complex, bidirectional "friend" relationships through an Apache TinkerPop Gremlin graph database, isolating graph logic from the primary data store.
- **Modular Design**: The application is structured into distinct feature modules (e.g., `Person`, `BankAccount`, `BankProcess`) to ensure separation of concerns and maintainability.

---

## Features

- **RESTful APIs**: Provides comprehensive and documented endpoints for managing Persons, Bank Accounts, and Transactions.
- **Sequential Batch Processing**: A webhook-driven system to execute financial calculations in a dependent sequence:
  1.  **Update Balances**: Ingests new transactions to update account totals.
  2.  **Calculate Net Worth**: Aggregates account balances to determine a person's net worth.
  3.  **Calculate Loan Potential**: Determines borrowing capacity based on the net worth of a person's friends.
- **Database Seeding**: A dedicated endpoint to populate the database with mock data for development and testing.
- **API Documentation**: Leverages OpenAPI (Swagger) for interactive API documentation and testing.

---

## Tech Stack

- **Framework**: NestJS
- **ORM**: TypeORM
- **Databases**: PostgreSQL, Gremlin
- **Containerization**: Docker, Docker Compose
- **Package Manager**: Yarn

---

## Local Development

### Prerequisites

- Docker Engine
- Docker Compose

### Launch Environment

```bash
docker-compose up --build
```

This command provisions and starts all required services (app, postgres, gremlin). The API will be accessible at `http://localhost:3000`.

---

## Usage & Workflow

### API Exploration

All endpoints are documented and executable via the Swagger UI at **[http://localhost:3000/api](http://localhost:3000/api)**.

### Standard Workflow

1.  **Seed Data**: Send a `POST` request to `/seed` to populate the databases with a consistent set of mock data.
2.  **Run Processes**: Send a `POST` request to `/processes` with a `processId` (1, 2, or 3) to trigger the corresponding financial calculations.

---

## Testing

Execute the full suite of unit and integration tests:

```bash
yarn test
```

---

## Key Design Decision

- **Loan Potential Metric**: The term "Kontostand" (account balance) from the requirements was interpreted as **Net Worth**. A person's total wealth is a more stable and realistic indicator of their financial standing than a single account's balance, leading to a more meaningful implementation of the loan potential calculation.

