import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { CreateBankTransactionDto } from '../dto/create-bank-transaction.dto';
import { BankAccount } from '../../bank-account/entities/bank-account.entity';

@Injectable()
export class BankTransactionRepository {
    private readonly logger = new Logger(BankTransactionRepository.name);

    constructor(
        @InjectRepository(BankTransaction)
        private readonly transactionRepo: Repository<BankTransaction>,
    ) {}

    /**
     * Create a new bank transaction
     */
    async create(dto: CreateBankTransactionDto, bankAccount: BankAccount): Promise<BankTransaction> {
        this.logger.log(`Creating transaction for account: ${dto.iban}`);
        
        const transaction = this.transactionRepo.create({
            ...dto,
            bankAccount: bankAccount,
            processed: false, // New transactions are always unprocessed
        });
        return this.transactionRepo.save(transaction);
    }

    /**
     * Find all bank transactions
     */
    async findAll(): Promise<BankTransaction[]> {
        return this.transactionRepo.find({ relations: ['bankAccount'] });
    }

    /**
     * Find transactions by bank account IBAN
     */
    async findByIban(iban: string): Promise<BankTransaction[]> {
        return this.transactionRepo.find({
            where: { bankAccount: { iban: iban } },
            relations: ['bankAccount'],
        });
    }

    /**
     * Find a bank transaction by its ID
     */
    async findById(id: string): Promise<BankTransaction | null> {
        return this.transactionRepo.findOne({
            where: { id },
            relations: ['bankAccount'],
        });
    }
}
