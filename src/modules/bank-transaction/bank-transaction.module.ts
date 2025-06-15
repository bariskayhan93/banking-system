import { Module } from '@nestjs/common';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransactionController } from './bank-transaction.controller';
import {BankTransaction} from "./entities/bank-transaction.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {BankAccount} from "../bank-account/bank-account.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BankTransaction,BankAccount])],
  controllers: [BankTransactionController],
  providers: [BankTransactionService],
})
export class BankTransactionModule {}
