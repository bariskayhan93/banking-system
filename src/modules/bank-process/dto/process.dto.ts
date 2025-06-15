import {IsIn, IsNumber} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class ProcessDto {
    @ApiProperty({ enum: [1, 2, 3] })
    @IsNumber()
    @IsIn([1, 2, 3])
    processId: number;
}