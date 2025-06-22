# Banking System

A concise backend application to handle banking data and related processes.

## Features
- Processes daily bank transactions to update balances and net worth.
- Provides APIs to query user, account, and friend-based lending information.

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/bariskayhan93/banking-system.git
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the application:
   ```bash
   yarn start:dev
   ```

## Usage
- Access Swagger UI at: <http://localhost:3000/api> (adjust port if necessary).
- Make requests to the available endpoints (e.g., process daily transactions, retrieve account details, calculate lending limits) as documented.

## Testing with Swagger UI

The application provides a comprehensive Swagger UI interface for testing all API endpoints.

### Getting Started

1. Start the application using `yarn start:dev`
2. Navigate to <http://localhost:3000/api> in your browser
3. You'll see the complete API documentation organized by modules:
   - Persons
   - Bank Accounts
   - Bank Transactions
   - Processes
   - Seed

### Testing Flow

For a complete testing experience, follow these steps:

1. **Seed Test Data**: 
   - Expand the "Seed" section
   - Execute the `POST /seed/all` endpoint to populate the database with test data
   - You can verify seeding status with `GET /seed/status`

2. **Explore Entities**:
   - Use `GET /persons`, `GET /bank-accounts`, and `GET /bank-transactions` endpoints to view the seeded data

3. **Test Banking Processes**:
   - Use `POST /processes` with process_id=1 to update account balances
   - Use `POST /processes` with process_id=2 to calculate net worths
   - Use `POST /processes` with process_id=3 to calculate borrowable amounts

4. **Explore Specific Details**:
   - Get borrowable amount for a specific person with `GET /persons/{id}/borrowable-amount`
   - View accounts for a person with `GET /bank-accounts?personId={id}`
   - View transactions for an account with `GET /bank-transactions?iban={iban}`

### Tips for Testing

- The Swagger UI allows you to expand/collapse all operations using the buttons at the top
- You can filter operations by typing in the search box
- Click the "Schema" link in response descriptions to see detailed response structures
- Use the "Try it out" button to execute requests directly from the UI
- Responses include both data and HTTP status codes for validation

This testing interface makes it easy to verify all the banking system functionality works correctly.
