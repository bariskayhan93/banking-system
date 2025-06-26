import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsValidIban } from '../../../common/validators/iban.validator';

export class CreateBankTransactionDto {
  @ApiProperty({
    example: 'DE89370400440532013000',
    description: 'IBAN of the account for this transaction',
  })
  @IsString()
  @IsNotEmpty()
  @IsValidIban()
  iban: string;

  @ApiProperty({
    example: 'FR7630006000011234567890189',
    required: false,
    description: 'IBAN of the other party in the transaction (optional)',
  })
  @IsOptional()
  @IsString()
  @IsValidIban()
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
