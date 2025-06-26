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

  async create(person: Person, dto: CreateBankAccountDto): Promise<BankAccount> {
    this.logger.log(`Creating account: ${dto.iban}`);

    const bankAccount = this.typeormRepo.create({
      ...dto,
      person,
    });
    return this.typeormRepo.save(bankAccount);
  }

  async findAll(): Promise<BankAccount[]> {
    return this.typeormRepo.find({
      relations: ['person'],
    });
  }

  async findByIban(iban: string): Promise<BankAccount | null> {
    return this.typeormRepo.findOne({
      where: { iban },
      relations: ['person'],
    });
  }

  async findByPersonId(personId: string): Promise<BankAccount[]> {
    return this.typeormRepo.find({
      where: { person: { id: personId } },
      relations: ['person'],
    });
  }

  async remove(iban: string): Promise<void> {
    const result = await this.typeormRepo.delete({ iban });
    if (result.affected === 0) {
      throw new NotFoundException(`Account ${iban} not found`);
    }
  }
}
