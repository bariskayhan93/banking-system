import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountController } from './bank-account.controller';
import { BankAccountService } from './bank-account.service';
import { BankAccount } from './entities/bank-account.entity';
import { BankAccountRepository } from './repositories/bank-account.repository';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankAccount]),
    PersonModule
  ],
  controllers: [BankAccountController],
  providers: [BankAccountService, BankAccountRepository],
  exports: [BankAccountService, BankAccountRepository]
})
export class BankAccountModule {}
