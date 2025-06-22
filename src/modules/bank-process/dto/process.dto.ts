import { IsIn, IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';

/**
 * DTO for processing webhook requests
 */
export class ProcessDto {
    @ApiProperty({ 
        enum: [1, 2, 3],
        description: 'Process ID to execute: 1 = Update balances, 2 = Calculate net worths, 3 = Calculate loan potentials',
        example: 3
    })
    @Type(() => Number)
    @IsNumber()
    @IsIn([1, 2, 3])
    processId: number;
}