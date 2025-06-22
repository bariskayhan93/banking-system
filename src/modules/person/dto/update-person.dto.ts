import { IsEmail, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonDto } from './create-person.dto';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
  @ApiProperty({ description: 'Person name', example: 'Jane Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Person email', example: 'jane@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Person net worth', example: 5000, required: false })
  @IsNumber()
  @IsOptional()
  netWorth?: number;
}