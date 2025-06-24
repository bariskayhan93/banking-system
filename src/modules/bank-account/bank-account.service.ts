import {Injectable, Logger, NotFoundException, ConflictException} from '@nestjs/common';
import {CreateBankAccountDto} from "./dto/create-bank-account.dto";
import {BankAccount} from "./entities/bank-account.entity";
import {BankAccountRepository} from './repositories/bank-account.repository';
import {PersonRepository} from '../person/repositories/person.repository';

@Injectable()
export class BankAccountService {
    private readonly logger = new Logger(BankAccountService.name);

    constructor(
        private readonly repository: BankAccountRepository,
        private readonly personRepository: PersonRepository,
    ) {}

    async create(dto: CreateBankAccountDto): Promise<BankAccount> {
        this.logger.log(`Creating bank account with IBAN: ${dto.iban}`);

        const person = await this.personRepository.findById(dto.personId);

        const existingAccount = await this.repository.findByIban(dto.iban);
        if (existingAccount) {
            throw new ConflictException(`Bank account with IBAN ${dto.iban} already exists.`);
        }

        return this.repository.create(person, dto);
    }

    async findAll(): Promise<BankAccount[]> {
        return this.repository.findAll();
    }

    async findOne(iban: string): Promise<BankAccount> {
        const account = await this.repository.findByIban(iban);
        if (!account) {
            throw new NotFoundException(`Bank account with IBAN ${iban} not found.`);
        }
        return account;
    }

    async findByPersonId(personId: string): Promise<BankAccount[]> {
        await this.personRepository.findById(personId);
        return this.repository.findByPersonId(personId);
    }

    async remove(iban: string): Promise<void> {
        await this.findOne(iban);
        await this.repository.remove(iban);
    }
}
