import {ApiProperty} from '@nestjs/swagger';
import {IsEmail, IsNotEmpty, IsString, MaxLength} from 'class-validator';

export class CreatePersonDto {
    @ApiProperty({
        example: 'Alice Johnson',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        example: 'alice@example.com',
        maxLength: 255
    })
    @IsString()
    @IsEmail()
    @MaxLength(255)
    email: string;
}