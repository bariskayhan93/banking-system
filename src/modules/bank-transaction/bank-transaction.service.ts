import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankTransactionRepository } from './repositories/bank-transaction.repository';
import { BankAccountRepository } from '../bank-account/repositories/bank-account.repository';

@Injectable()
export class BankTransactionService {
  private readonly logger = new Logger(BankTransactionService.name);

  constructor(
    private readonly repository: BankTransactionRepository,
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async create(dto: CreateBankTransactionDto): Promise<BankTransaction> {
    this.logger.log(`Creating transaction for account: ${dto.iban}`);

    const bankAccount = await this.bankAccountRepository.findByIban(dto.iban);
    if (!bankAccount) {
      throw new NotFoundException(`Bank account with IBAN ${dto.iban} not found.`);
    }

    return this.repository.create(dto, bankAccount);
  }

  async findAll(): Promise<BankTransaction[]> {
    return this.repository.findAll();
  }

  async findByIban(iban: string): Promise<BankTransaction[]> {
    return this.repository.findByIban(iban);
  }
}
