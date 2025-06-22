import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransactionController } from './bank-transaction.controller';
import { BankTransaction } from "./entities/bank-transaction.entity";
import { BankTransactionRepository } from './repositories/bank-transaction.repository';
import { BankAccountModule } from "../bank-account/bank-account.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([BankTransaction]),
    BankAccountModule
  ],
  controllers: [BankTransactionController],
  providers: [BankTransactionService, BankTransactionRepository],
  exports: [BankTransactionService, BankTransactionRepository]
})
export class BankTransactionModule {}
