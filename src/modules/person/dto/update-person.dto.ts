import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreatePersonDto } from './create-person.dto';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
  @ApiProperty({
    example: 5000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  netWorth?: number;

  @ApiProperty({
    example: 'google-oauth2|103103757533916682021',
    required: false,
  })
  @IsString()
  @IsOptional()
  auth0UserId?: string;
}
