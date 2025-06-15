import {IsNotEmpty, IsString, IsUUID} from 'class-validator';

export class CreateBankAccountDto {
    @IsString()
    @IsNotEmpty()
    iban: string;

    @IsString()
    @IsNotEmpty()
    bankName: string;

    @IsUUID()
    personId: string;
}
