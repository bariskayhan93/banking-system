import { Module } from '@nestjs/common';
import { PersonModule } from './modules/person/person.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { TestModule } from './modules/test/test.module';
@Module({
  imports: [PersonModule, BankAccountModule, TransactionModule, TestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
