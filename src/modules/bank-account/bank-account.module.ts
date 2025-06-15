import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BankAccount} from './bank-account.entity';
import {BankAccountService} from './bank-account.service';
import {BankAccountController} from './bank-account.controller';
import {Person} from '../person/person.entity';

@Module({
    imports: [TypeOrmModule.forFeature([BankAccount, Person])],
    providers: [BankAccountService],
    controllers: [BankAccountController],
})
export class BankAccountModule {}
