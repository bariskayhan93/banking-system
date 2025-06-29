import { IsString, IsNumber, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBankTransactionDto {
  @ApiProperty({
    example: 'DE89370400440532013000',
    description: 'IBAN of the account for this transaction',
  })
  @IsString()
  @IsNotEmpty()
  @Length(15, 34, { message: 'IBAN must be between 15 and 34 characters' })
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, {
    message: 'IBAN must start with 2 letters, 2 digits, followed by alphanumeric characters',
  })
  iban: string;

  @ApiProperty({
    example: 'FR7630006000011234567890189',
    required: false,
    description: 'IBAN of the other party in the transaction (optional)',
  })
  @IsOptional()
  @IsString()
  @Length(15, 34, { message: 'IBAN must be between 15 and 34 characters' })
  @Matches(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/, {
    message: 'IBAN must start with 2 letters, 2 digits, followed by alphanumeric characters',
  })
  otherIban?: string;

  @ApiProperty({
    example: 120.5,
    description: 'Transaction amount (positive for deposits, negative for withdrawals)',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'Monthly rent payment',
    required: false,
    description: 'Transaction description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
