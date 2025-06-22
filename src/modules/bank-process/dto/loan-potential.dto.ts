import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class LoanPotentialDto {
    @ApiProperty({
        description: 'Person ID for whom the loan potential is calculated',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    @IsNotEmpty()
    personId: string;

    @ApiProperty({
        description: 'Maximum amount the person can borrow from their friends',
        example: 1500.75
    })
    @IsNumber({
        allowNaN: false,
        allowInfinity: false,
        maxDecimalPlaces: 2
    })
    maxLoanAmount: number;
}
