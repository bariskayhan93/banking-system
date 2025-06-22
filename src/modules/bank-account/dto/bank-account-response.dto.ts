import { ApiProperty } from '@nestjs/swagger';
import { PersonResponseDto } from '../../person/dto/person-response.dto';
import { BankAccount } from '../entities/bank-account.entity';

export class BankAccountResponseDto {
    @ApiProperty({
        description: 'The IBAN of the bank account',
        example: 'DE89370400440532013000',
    })
    iban: string;

    @ApiProperty({
        description: 'The name of the bank',
        example: 'N26',
    })
    bankName: string;

    @ApiProperty({
        description: 'The current balance of the account',
        example: 1500.50,
    })
    balance: number;

    @ApiProperty({
        description: 'The owner of the bank account',
        type: () => PersonResponseDto,
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

