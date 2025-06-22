import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SeedService} from './seed.service';
import {GremlinModule} from '../gremlin/gremlin.module';
import {Person} from '../person/entities/person.entity';
import {SeedController} from './seed.controller';
import {BankAccount} from '../bank-account/entities/bank-account.entity';
import {PersonModule} from '../person/person.module';
import {BankAccountModule} from '../bank-account/bank-account.module';
import {BankTransactionModule} from '../bank-transaction/bank-transaction.module';
import {BankTransaction} from '../bank-transaction/entities/bank-transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Person, BankAccount, BankTransaction]),
        GremlinModule,
        PersonModule,
        BankAccountModule,
        BankTransactionModule,
    ],
    providers: [SeedService],
    controllers: [SeedController],
    exports: [SeedService],
})
export class SeedModule {}