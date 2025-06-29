import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

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

  @ApiProperty({
    example: 'alice@example.com',
    maxLength: 255,
  })
  @IsString()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'google-oauth2|103103757533916682021',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  auth0UserId?: string;
}
