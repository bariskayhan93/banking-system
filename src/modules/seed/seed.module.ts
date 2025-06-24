import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { GremlinModule } from '../gremlin/gremlin.module';
import { PersonModule } from '../person/person.module';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { BankTransactionModule } from '../bank-transaction/bank-transaction.module';
import { Person } from '../person/entities/person.entity';
import { BankAccount } from '../bank-account/entities/bank-account.entity';
import { BankTransaction } from '../bank-transaction/entities/bank-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, BankAccount, BankTransaction]),
    GremlinModule,
    PersonModule,
    BankAccountModule,
    BankTransactionModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}