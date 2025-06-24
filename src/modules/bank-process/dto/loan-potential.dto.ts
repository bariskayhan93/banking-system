import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsNumber, IsUUID} from 'class-validator';

export class LoanPotentialDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    personId: string;

    @ApiProperty({
        example: 1500.75
    })
    @IsNumber({
        allowNaN: false,
        allowInfinity: false,
        maxDecimalPlaces: 2
    })
    maxLoanAmount: number;
}
