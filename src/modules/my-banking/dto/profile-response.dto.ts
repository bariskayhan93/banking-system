import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../person/entities/person.entity';

export class MyProfileResponseDto {
  @ApiProperty({
    example: '9c8a0257-4098-4d8e-b433-0695185a9874',
    description: 'User unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Barış Kayhan',
    description: 'User display name',
  })
  name: string;

  @ApiProperty({
    example: 'bariskayhan53@gmail.com',
    description: 'User email address',
  })
  email: string;

  constructor(person: Person) {
    this.id = person.id;
    this.name = person.name;
    this.email = person.email;
  }
}