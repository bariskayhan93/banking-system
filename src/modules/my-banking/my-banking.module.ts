import { Module } from '@nestjs/common';
import { MyBankingController } from './my-banking.controller';
import { MyBankingService } from './my-banking.service';
import { PersonModule } from '../person/person.module';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { BankTransactionModule } from '../bank-transaction/bank-transaction.module';
import { BankProcessModule } from '../bank-process/bank-process.module';
import { AuthModule } from '../../common/auth/auth.module';
import { UserService } from '../../common/services/user.service';

@Module({
  imports: [
    PersonModule,
    BankAccountModule, 
    BankTransactionModule,
    BankProcessModule,
    AuthModule
  ],
  controllers: [MyBankingController],
  providers: [MyBankingService, UserService],
})
export class MyBankingModule {}