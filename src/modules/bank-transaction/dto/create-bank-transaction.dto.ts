import {IsString, IsNumber, IsDateString, IsNotEmpty} from 'class-validator';

export class CreateBankTransactionDto {
    @IsString()
    @IsNotEmpty()
    counterpartyIban: string;

    @IsNumber()
    amount: number;

    @IsNotEmpty()
    bankAccountId: number;

    @IsDateString()
    createdAt: string;
}