import {IsEmail, IsNotEmpty, IsOptional} from 'class-validator';

export class CreatePersonDto {
    @IsNotEmpty()
    firstName: string;
    
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    email: string;
}
