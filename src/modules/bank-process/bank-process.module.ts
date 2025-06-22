import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BankProcessController} from './bank-process.controller';
import {BankProcessService} from './bank-process.service';
import {BankProcessRepository} from './repositories/bank-process.repository';
import {GremlinModule} from '../gremlin/gremlin.module';
import {Person} from '../person/entities/person.entity';
import {BankAccount} from '../bank-account/entities/bank-account.entity';
import {BankTransaction} from '../bank-transaction/entities/bank-transaction.entity';
import {PersonRepository} from "../person/repositories/person.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Person, BankAccount, BankTransaction]),
        GremlinModule
    ],
    controllers: [BankProcessController],
    providers: [
        BankProcessService,
        BankProcessRepository,
        PersonRepository
    ],
    exports: [BankProcessService]
})
export class BankProcessModule {
}
