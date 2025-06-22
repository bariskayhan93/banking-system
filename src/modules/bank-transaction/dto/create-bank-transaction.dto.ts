import { IsString, IsNumber, IsDateString, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBankTransactionDto {
    @ApiProperty({
        description: 'IBAN of the bank account for this transaction',
        example: 'DE89370400440532013000'
    })
    @IsString()
    @IsNotEmpty()
    iban: string;

    @ApiProperty({
        description: 'IBAN of the other party involved in the transaction',
        example: 'FR7630006000011234567890189',
        required: false
    })
    @IsOptional()
    @IsString()
    otherIban?: string;

    @ApiProperty({
        description: 'Transaction amount (positive for credit, negative for debit)',
        example: 120.50
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(-100000000)
    @Max(100000000)
    amount: number;
    
    @ApiProperty({
        description: 'Optional description of the transaction',
        example: 'Monthly salary payment',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Transaction date and time',
        example: '2025-06-22T10:00:00Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    createdAt?: string;
}