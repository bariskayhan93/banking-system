import {Module} from '@nestjs/common';
import {AdminController} from './admin.controller';
import {PersonModule} from '../person/person.module';
import {BankAccountModule} from '../bank-account/bank-account.module';
import {BankProcessModule} from '../bank-process/bank-process.module';

@Module({
  imports: [PersonModule, BankAccountModule, BankProcessModule],
  controllers: [AdminController],
})
export class AdminModule {}
