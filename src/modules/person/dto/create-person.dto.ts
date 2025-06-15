import {IsEmail, IsNotEmpty, IsOptional} from 'class-validator';

export class CreatePersonDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;
}
