import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { BankTransaction } from './entities/bank-transaction.entity';
import { BankTransactionRepository } from './repositories/bank-transaction.repository';
import { BankAccountRepository } from '../bank-account/repositories/bank-account.repository';

@Injectable()
export class BankTransactionService {
    private readonly logger = new Logger(BankTransactionService.name);
    
    constructor(
        private readonly bankTransactionRepository: BankTransactionRepository,
        private readonly bankAccountRepository: BankAccountRepository,
    ) {}

    /**
     * Create a new bank transaction
     */
    async create(dto: CreateBankTransactionDto): Promise<BankTransaction> {
        this.logger.log(`Creating transaction for account: ${dto.iban}`);
        
        const bankAccount = await this.bankAccountRepository.findByIban(dto.iban);
        if (!bankAccount) {
            throw new NotFoundException(`Bank account with IBAN ${dto.iban} not found.`);
        }
        
        return this.bankTransactionRepository.create(dto, bankAccount);
    }

    /**
     * Get all bank transactions
     */
    async findAll(): Promise<BankTransaction[]> {
        return this.bankTransactionRepository.findAll();
    }

    /**
     * Get transactions for a specific bank account
     */
    async findByIban(iban: string): Promise<BankTransaction[]> {
        const bankAccount = await this.bankAccountRepository.findByIban(iban);
        if (!bankAccount) {
            throw new NotFoundException(`Bank account with IBAN ${iban} not found.`);
        }
        return this.bankTransactionRepository.findByIban(iban);
    }
}
