import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../entities/bank-account.entity';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { Person } from '../../person/entities/person.entity';

@Injectable()
export class BankAccountRepository {
  private readonly logger = new Logger(BankAccountRepository.name);

  constructor(
    @InjectRepository(BankAccount)
    private readonly typeormRepo: Repository<BankAccount>,
  ) {}

  /**
   * Create a new bank account
   */
  async create(personId: string, createDto: CreateBankAccountDto): Promise<BankAccount> {
    this.logger.log(`Creating bank account ${createDto.iban} for person ${personId}`);

    const bankAccount = this.typeormRepo.create({
      ...createDto,
      balance: 0, // Initial balance is 0
      person: { id: personId } as Person,
    });
    return this.typeormRepo.save(bankAccount);
  }

  /**
   * Find a bank account by IBAN
   */
  async findByIban(iban: string): Promise<BankAccount | null> {
    return this.typeormRepo.findOne({
      where: { iban },
      relations: ['person'],
    });
  }

  /**
   * Find all bank accounts
   */
  async findAll(): Promise<BankAccount[]> {
    return this.typeormRepo.find({
      relations: ['person'],
    });
  }

  /**
   * Find bank accounts by person ID
   */
  async findByPersonId(personId: string): Promise<BankAccount[]> {
    return this.typeormRepo.find({
      where: { person: { id: personId } },
      relations: ['person'],
    });
  }

  /**
   * Delete a bank account
   */
  async remove(iban: string): Promise<void> {
    const result = await this.typeormRepo.delete({ iban });
    if (result.affected === 0) {
      throw new NotFoundException(`Bank account with IBAN ${iban} not found`);
    }
  }
}
