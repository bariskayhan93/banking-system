import {ApiProperty} from '@nestjs/swagger';
import {BankTransaction} from '../entities/bank-transaction.entity';
import {BankAccountResponseDto} from '../../bank-account/dto/bank-account-response.dto';

export class BankTransactionResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the transaction',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    id: string;

    @ApiProperty({
        description: 'The amount of the transaction (positive for income, negative for expense)',
        example: -50.25,
    })
    amount: number;

    @ApiProperty({
        description: 'A description of the transaction',
        example: 'Groceries',
    })
    description: string;

    @ApiProperty({
        description: 'The IBAN of the other party in the transaction',
        example: 'FR7630006000011234567890189',
    })
    otherIban: string;

    @ApiProperty({
        description: 'The timestamp when the transaction was created',
        example: '2025-06-23T10:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'The timestamp when the transaction was last updated',
        example: '2025-06-24T02:00:00.000Z',
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'Indicates if the transaction has been processed and included in the account balance',
        example: false,
    })
    processed: boolean;

    @ApiProperty({
        description: 'The bank account this transaction belongs to',
        type: () => BankAccountResponseDto,
    })
    bankAccount: BankAccountResponseDto;

    constructor(transaction: BankTransaction) {
        this.id = transaction.id;
        this.amount = Number(transaction.amount);
        this.description = transaction.description!;
        this.otherIban = transaction.otherIban!;
        this.createdAt = transaction.createdAt;
        this.processed = transaction.processed;
        this.updatedAt = transaction.updatedAt;
        if (transaction.bankAccount) {
            this.bankAccount = new BankAccountResponseDto(transaction.bankAccount);
        }
    }
}
