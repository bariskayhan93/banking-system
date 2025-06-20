import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BankAccountService} from './bank-account.service';
import {BankAccountController} from './bank-account.controller';
import {Person} from '../person/entities/person.entity';
import {BankAccount} from "./entities/bank-account.entity";

@Module({
    imports: [TypeOrmModule.forFeature([BankAccount, Person])],
    providers: [BankAccountService],
    controllers: [BankAccountController],
    exports: [TypeOrmModule],
})
export class BankAccountModule {}
