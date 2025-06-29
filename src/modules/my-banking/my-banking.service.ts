import { Injectable } from '@nestjs/common';
import { UserService } from '../../common/services/user.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankTransactionService } from '../bank-transaction/bank-transaction.service';
import { BankProcessService } from '../bank-process/bank-process.service';
import { MyProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class MyBankingService {
  constructor(
    private readonly userService: UserService,
    private readonly bankAccountService: BankAccountService,
    private readonly bankTransactionService: BankTransactionService,
    private readonly bankProcessService: BankProcessService,
  ) {}

  async getProfile(auth0User: any, include?: string) {
    const user = await this.userService.resolve(auth0User);
    if (!user) return null;

    const profile = new MyProfileResponseDto(user);
    const includes = include?.split(',') || [];
    const result: any = { ...profile };

    if (includes.includes('loan-potential')) {
      result.loanPotential = await this.bankProcessService.getLoanPotentialForPerson(user.id);
    }

    return result;
  }

  async updateProfile(auth0User: any, updateData: any) {
    const user = await this.userService.resolve(auth0User);
    if (!user) return null;
    return new MyProfileResponseDto(user);
  }

  async getBanking(auth0User: any, include?: string) {
    const user = await this.userService.resolve(auth0User);
    if (!user) return null;

    const accounts = await this.bankAccountService.findByPersonId(user.id);
    const includes = include?.split(',') || [];
    const result: any = {
      accounts,
      summary: {
        totalBalance: accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
        accountCount: accounts.length,
      },
    };

    if (includes.includes('transactions')) {
      const allTransactions: any[] = [];
      for (const account of accounts) {
        const transactions = await this.bankTransactionService.findByIban(account.iban);
        allTransactions.push(...transactions);
      }
      result.transactions = allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  async createTransaction(auth0User: any, transactionData: any) {
    const user = await this.userService.resolve(auth0User);
    if (!user) return null;
    return { message: 'Transaction endpoint ready for implementation' };
  }

  async manageFriends(auth0User: any, friendData: any) {
    const user = await this.userService.resolve(auth0User);
    if (!user) return null;
    return { message: 'Friend management endpoint ready for implementation' };
  }
}