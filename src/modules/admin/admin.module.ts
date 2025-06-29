import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PersonModule } from '../person/person.module';
import { BankAccountModule } from '../bank-account/bank-account.module';
import { BankProcessModule } from '../bank-process/bank-process.module';
import { AuthModule } from '../../common/auth/auth.module';
import { UserService } from '../../common/services/user.service';

@Module({
  imports: [PersonModule, BankAccountModule, BankProcessModule, AuthModule],
  controllers: [AdminController],
  providers: [UserService],
})
export class AdminModule {}
