import {IsString, IsNumber, IsNotEmpty, IsOptional, Min, Max} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';

export class CreateBankTransactionDto {
    @ApiProperty({
        example: 'DE89370400440532013000'
    })
    @IsString()
    @IsNotEmpty()
    iban: string;

    @ApiProperty({
        example: 'FR7630006000011234567890189',
        required: false
    })
    @IsOptional()
    @IsString()
    otherIban?: string;

    @ApiProperty({
        example: 120.50
    })
    @Type(() => Number)
    @IsNumber({maxDecimalPlaces: 2})
    @Min(-100000000)
    @Max(100000000)
    amount: number;

    @ApiProperty({
        example: 'Monthly rent payment',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;
}