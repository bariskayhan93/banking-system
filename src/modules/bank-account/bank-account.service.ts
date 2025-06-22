import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateBankAccountDto } from "./dto/create-bank-account.dto";
import { BankAccount } from "./entities/bank-account.entity";
import { BankAccountRepository } from './repositories/bank-account.repository';
import { PersonRepository } from '../person/repositories/person.repository';

@Injectable()
export class BankAccountService {
    private readonly logger = new Logger(BankAccountService.name);

    constructor(
        private readonly bankAccountRepository: BankAccountRepository,
        private readonly personRepository: PersonRepository,
    ) {}

    /**
     * Create a new bank account
     */
    async create(dto: CreateBankAccountDto): Promise<BankAccount> {
        this.logger.log(`Creating bank account with IBAN: ${dto.iban}`);
        
        // Verify the person exists
        await this.personRepository.findById(dto.personId);
        
        // Check for existing account with the same IBAN
        const existingAccount = await this.bankAccountRepository.findByIban(dto.iban);
        if (existingAccount) {
            throw new ConflictException(`Bank account with IBAN ${dto.iban} already exists.`);
        }
        
        return this.bankAccountRepository.create(dto.personId, dto);
    }

    /**
     * Get all bank accounts
     */
    async findAll(): Promise<BankAccount[]> {
        return this.bankAccountRepository.findAll();
    }

    /**
     * Get a bank account by IBAN
     */
    async findOne(iban: string): Promise<BankAccount> {
        const account = await this.bankAccountRepository.findByIban(iban);
        if (!account) {
            throw new NotFoundException(`Bank account with IBAN ${iban} not found.`);
        }
        return account;
    }

    /**
     * Get all bank accounts belonging to a person
     */
    async findByPersonId(personId: string): Promise<BankAccount[]> {
        // Verify the person exists
        await this.personRepository.findById(personId);
        
        return this.bankAccountRepository.findByPersonId(personId);
    }

    /**
     * Delete a bank account
     */
    async remove(iban: string): Promise<void> {
        await this.findOne(iban);
        await this.bankAccountRepository.remove(iban);
    }
}
