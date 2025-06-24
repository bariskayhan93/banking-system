import {IsNumber, IsOptional} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';
import {PartialType} from '@nestjs/swagger';
import {CreatePersonDto} from './create-person.dto';

export class UpdatePersonDto extends PartialType(CreatePersonDto) {
    @ApiProperty({
        example: 5000,
        required: false
    })
    @IsNumber()
    @IsOptional()
    netWorth?: number;
}