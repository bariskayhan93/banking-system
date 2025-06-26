import { ApiProperty } from '@nestjs/swagger';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { BankAccountResponseDto } from '../../bank-account/dto/bank-account-response.dto';

export class BankTransactionResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    example: -50.25,
  })
  amount: number;

  @ApiProperty({
    example: 'Groceries',
  })
  description: string;

  @ApiProperty({
    example: 'FR7630006000011234567890189',
  })
  otherIban: string;

  @ApiProperty({
    example: '2025-06-23T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-06-24T02:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    type: () => BankAccountResponseDto,
  })
  bankAccount: BankAccountResponseDto;

  constructor(transaction: BankTransaction) {
    this.id = transaction.id;
    this.amount = Number(transaction.amount);
    this.description = transaction.description!;
    this.otherIban = transaction.otherIban!;
    this.createdAt = transaction.createdAt;
    this.updatedAt = transaction.updatedAt;

    if (transaction.bankAccount) {
      this.bankAccount = new BankAccountResponseDto(transaction.bankAccount);
    }
  }
}
