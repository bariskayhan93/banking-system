# Banking System Coding Standards

## Overview

This document outlines the coding standards and conventions for the Banking System project. Following these standards ensures consistency, maintainability, and readability across the codebase.

## Module Structure

Each module follows this standardized structure:

```
module-name/
├── module-name.controller.ts      # HTTP endpoints
├── module-name.service.ts         # Business logic
├── module-name.module.ts          # Module configuration
├── dto/                           # Data transfer objects
│   ├── create-module-name.dto.ts
│   ├── module-name-response.dto.ts
│   └── update-module-name.dto.ts
├── entities/                      # Database entities
│   └── module-name.entity.ts
└── repositories/                  # Data access layer
    └── module-name.repository.ts
```

## Naming Conventions

### Files
- Controllers: `module-name.controller.ts`
- Services: `module-name.service.ts`
- Entities: `module-name.entity.ts`
- DTOs: `create-module-name.dto.ts`, `module-name-response.dto.ts`
- Repositories: `module-name.repository.ts`

### Classes
- Controllers: `ModuleNameController`
- Services: `ModuleNameService`
- Entities: `ModuleName` (singular)
- DTOs: `CreateModuleNameDto`, `ModuleNameResponseDto`
- Repositories: `ModuleNameRepository`

### Variables and Methods
- Use camelCase: `personId`, `calculateLoanAmount`
- Constants use UPPER_CASE: `MAX_DIRECT_FRIENDS`
- Boolean variables use descriptive names: `isSeeded`, `friendshipExists`

## Import Statements

### Formatting
```typescript
// ✅ Correct - consistent spacing
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// ❌ Incorrect - inconsistent spacing
import {Controller, Get, Post, Body} from '@nestjs/common';
import { ApiOperation,ApiTags } from '@nestjs/swagger';
```

### Ordering
1. Node.js built-in modules
2. External packages (@nestjs, typeorm, etc.)
3. Internal modules (relative imports)
4. Configuration imports

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonRepository } from './repositories/person.repository';
import { FRIENDSHIP_CONFIG } from '../../common/config/friendship.config';
```

## Object Literal Formatting

### Decorators
```typescript
// ✅ Correct - consistent spacing
@ApiOperation({ summary: 'Create a new person' })
@ApiParam({ name: 'id', description: 'Person ID', type: String })

// ❌ Incorrect - inconsistent spacing
@ApiOperation({summary: 'Create a new person'})
@ApiParam({name: 'id', description: 'Person ID', type: String})
```

### Return Objects
```typescript
// ✅ Correct
return { message: 'Success', data: result };

// ❌ Incorrect
return {message: 'Success', data: result};
```

## Constructor Parameter Formatting

### Multi-line Parameters
```typescript
// ✅ Correct - consistent indentation
constructor(
  private readonly repository: PersonRepository,
  private readonly gremlinService: GremlinService,
) {}

// ❌ Incorrect - inconsistent indentation
constructor(
    private readonly repository: PersonRepository,
    private readonly gremlinService: GremlinService,
) {}
```

## Configuration Management

### Extract Constants
```typescript
// ✅ Correct - use configuration files
import { FRIENDSHIP_CONFIG } from '../../common/config/friendship.config';

if (stats.directFriends >= FRIENDSHIP_CONFIG.MAX_DIRECT_FRIENDS) {
  // ...
}

// ❌ Incorrect - hardcoded values
const MAX_DIRECT_FRIENDS = 1000;
if (stats.directFriends >= MAX_DIRECT_FRIENDS) {
  // ...
}
```

### Configuration Structure
- Place configs in `src/common/config/`
- Use descriptive names: `friendship.config.ts`, `seed.config.ts`
- Export as const objects with typed properties

## API Documentation

### Swagger Decorators
```typescript
@ApiOperation({ 
  summary: 'Create a new person',
  description: 'Creates a person record in the database'
})
@ApiCreatedResponse(PersonResponseDto, 'Person successfully created')
@ApiBadRequestResponse('Invalid input data')
@ApiConflictResponse('Email address is already in use')
```

### Response DTOs
```typescript
export class PersonResponseDto {
  @ApiProperty({
    example: '1f8e7a3c-9d4b-5c6a-8b2f-1e9d7f3a2c5b',
    description: 'Unique person identifier'
  })
  id: string;

  constructor(person: Person) {
    this.id = person.id;
    this.name = person.name;
    this.email = person.email;
  }
}
```

## Error Handling

### Exception Types
- `NotFoundException` - Resource not found
- `ConflictException` - Duplicate/constraint violations
- `BadRequestException` - Validation/business rule violations

### Error Messages
```typescript
// ✅ Correct - descriptive messages
throw new ConflictException(`Email ${dto.email} is already in use.`);
throw new NotFoundException(`Bank account with IBAN ${iban} not found.`);

// ❌ Incorrect - generic messages
throw new ConflictException('Conflict occurred');
throw new NotFoundException('Not found');
```

## Validation

### DTO Validation
```typescript
export class CreatePersonDto {
  @ApiProperty({
    example: 'Alice Johnson',
    maxLength: 100,
    description: 'Person name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
```

### Custom Validators
- Place in `src/common/validators/`
- Export validator functions and decorators
- Include comprehensive validation logic

## Database Patterns

### Entity Decorators
```typescript
@Entity('persons')
@Index(['email'])
@Index(['netWorth'])
export class Person {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
```

### Repository Methods
```typescript
async findById(id: string): Promise<Person> {
  const person = await this.repository.findOne({ where: { id } });
  if (!person) {
    throw new NotFoundException(`Person with ID ${id} not found.`);
  }
  return person;
}
```

## Testing Patterns

### Test File Structure
- Place test files alongside source files
- Use descriptive test names
- Group tests by functionality using `describe` blocks

### Mock Patterns
```typescript
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
} as jest.Mocked<PersonRepository>;
```

## Enforcement

### Automated Tools
- **ESLint**: Enforces code style and import ordering
- **Prettier**: Handles code formatting consistency
- **TypeScript**: Provides type safety and compilation checks

### Commands
```bash
# Format code
yarn format

# Lint code
yarn lint

# Type check
yarn build
```

### Pre-commit Hooks
Configure Git hooks to run linting and formatting before commits to ensure standards compliance.

## Best Practices

1. **Consistency First**: Follow existing patterns in the codebase
2. **Descriptive Naming**: Use clear, descriptive names for all identifiers
3. **Single Responsibility**: Each class/method should have one clear purpose
4. **Error Handling**: Always provide meaningful error messages
5. **Documentation**: Keep API documentation up to date
6. **Testing**: Write comprehensive tests for all business logic
7. **Configuration**: Extract all magic numbers and strings to config files

## Code Review Checklist

- [ ] Import statements properly formatted and ordered
- [ ] Object literals use consistent spacing
- [ ] Constructor parameters properly aligned
- [ ] No hardcoded values (use configuration)
- [ ] Proper error handling with descriptive messages
- [ ] API documentation complete and accurate
- [ ] Tests cover new functionality
- [ ] Follows established naming conventions