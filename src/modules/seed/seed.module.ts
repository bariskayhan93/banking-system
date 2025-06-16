import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {SeedService} from './seed.service';
import {GremlinModule} from '../gremlin/gremlin.module';
import {Person} from '../person/entities/person.entity';
import {BankTransaction} from '../bank-transaction/entities/bank-transaction.entity';
import {SeedController} from "./seed.controller";
import {BankAccount} from "../bank-account/entities/bank-account.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Person, BankAccount, BankTransaction]),
        GremlinModule
    ],
    providers: [SeedService],
    controllers: [SeedController],
    exports: [SeedService]
})
export class SeedModule {}