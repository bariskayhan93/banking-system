import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    private readonly typeormRepo: Repository<BankTransaction>,
  ) {}

  async create(dto: CreateBankTransactionDto, bankAccount: BankAccount): Promise<BankTransaction> {
    this.logger.log(`Creating transaction: ${dto.iban}`);

    const transaction = this.typeormRepo.create({
      ...dto,
      bankAccount,
      processed: false,
    });
    return this.typeormRepo.save(transaction);
  }

  async findAll(): Promise<BankTransaction[]> {
    return this.typeormRepo.find({ relations: ['bankAccount'] });
  }

  async findByIban(iban: string): Promise<BankTransaction[]> {
    return this.typeormRepo.find({
      where: { bankAccount: { iban } },
      relations: ['bankAccount'],
    });
  }

  async findById(id: string): Promise<BankTransaction> {
    const transaction = await this.typeormRepo.findOne({
      where: { id },
      relations: ['bankAccount'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }
}
