import {IsString, IsNumber, IsDateString, IsNotEmpty, IsOptional} from 'class-validator';

export class CreateBankTransactionDto {
    @IsString()
    @IsNotEmpty()
    iban: string;

    @IsNumber()
    amount: number;
    
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    createdAt: string;
}