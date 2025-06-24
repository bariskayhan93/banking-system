import {ApiProperty} from '@nestjs/swagger';
import {PersonResponseDto} from '../../person/dto/person-response.dto';
import {BankAccount} from '../entities/bank-account.entity';

export class BankAccountResponseDto {
    @ApiProperty({
        example: 'DE89370400440532013000'
    })
    iban: string;

    @ApiProperty({
        example: 'N26'
    })
    bankName: string;

    @ApiProperty({
        example: 1500.50
    })
    balance: number;

    @ApiProperty({
        type: () => PersonResponseDto
    })
    person: PersonResponseDto;

    constructor(bankAccount: BankAccount) {
        this.iban = bankAccount.iban;
        this.bankName = bankAccount.bankName;
        this.balance = Number(bankAccount.balance);
        if (bankAccount.person) {
            this.person = new PersonResponseDto(bankAccount.person);
        }
    }
}
