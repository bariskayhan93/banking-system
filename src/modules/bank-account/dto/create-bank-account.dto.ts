import {IsNotEmpty} from 'class-validator';

export class CreateBankAccountDto {
    @IsNotEmpty()
    iban: string;

    @IsNotEmpty()
    bankName: string;

    @IsNotEmpty()
    personId: number;
}
