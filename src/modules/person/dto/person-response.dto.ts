import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../entities/person.entity';

export class PersonResponseDto {
  @ApiProperty({
    example: '1f8e7a3c-9d4b-5c6a-8b2f-1e9d7f3a2c5b',
  })
  id: string;

  @ApiProperty({
    example: 'Alice Johnson',
  })
  name: string;

  @ApiProperty({
    example: 'alice@example.com',
  })
  email: string;

  constructor(person: Person) {
    this.id = person.id;
    this.name = person.name;
    this.email = person.email;
  }
}
