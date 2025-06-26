# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `docker-compose up --build` - Build and start all services (app, postgres, gremlin)
- `yarn build` - Build the NestJS application
- `yarn start:dev` - Start development server with hot reload
- `yarn start:prod` - Start production server

### Testing and Quality
- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage report
- `yarn test:e2e` - Run end-to-end tests
- `yarn lint` - Run ESLint with auto-fix
- `yarn format` - Format code with Prettier

### API Testing
- Access Swagger UI at `http://localhost:3000/api` for interactive API documentation
- Use `POST /seed` to populate databases with mock data
- Use `POST /processes` with processId (1, 2, or 3) to trigger sequential batch processing

## Architecture Overview

### Dual Database System
- **PostgreSQL**: Core business entities (Person, BankAccount, BankTransaction)
- **Gremlin Graph DB**: Social relationships (bidirectional friendships)
- This separation optimizes both transactional and graph operations

### Modular Structure
Each business domain follows the pattern:
- `Controller` - HTTP endpoints with Swagger documentation
- `Service` - Business logic implementation
- `Repository` - Data access with custom query methods
- `Entity` - TypeORM database models
- `DTOs` - Validated data transfer objects

### Sequential Processing System
The `BankProcessService` implements three dependent stages:
1. **Process 1**: Update account balances from transactions
2. **Process 2**: Calculate net worth aggregations
3. **Process 3**: Calculate loan potential based on friend network wealth

### Key Business Logic
- **Net Worth**: Aggregated from all bank account balances per person
- **Loan Potential**: Calculated as the difference between friend's net worth and person's net worth
  - Only friends with higher net worth can lend
  - Loan amount = Friend's Net Worth - Person's Net Worth
  - Individual loans capped at configurable maximum (default: 10,000)
- **Friend Network**: Bidirectional relationships stored in graph database

## Testing Strategy
- Unit tests exist for all core modules: person, bank-account, bank-transaction, bank-process, gremlin
- Use the seeding endpoint to create consistent test data
- Integration tests verify the sequential processing workflow

## Configuration Notes
- Environment variables configured via Docker Compose
- TypeORM configuration in `src/typeorm.config.ts`
- Gremlin connection managed by `GremlinService`
- Global validation and exception handling configured in `main.ts`
- Business logic configurations in `src/common/config/`:
  - `friendship.config.ts` - Friend network limits and settings
  - `seed.config.ts` - Database seeding parameters
  - `loan.config.ts` - Loan calculation parameters

## Code Standards
- **ESLint/Prettier**: Automated code formatting and linting
- **Import Ordering**: Consistent import statement organization
- **Object Spacing**: Standardized `{ key: value }` formatting
- **Constructor Alignment**: Uniform parameter formatting
- **Configuration Extraction**: All magic numbers moved to config files
- See `CODING_STANDARDS.md` for detailed style guide