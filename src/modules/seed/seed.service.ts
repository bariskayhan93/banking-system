import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Person} from '../person/entities/person.entity';
import {BankAccount} from '../bank-account/bank-account.entity';
import {BankTransaction} from '../bank-transaction/entities/bank-transaction.entity';
import {GremlinService} from '../gremlin/services/gremlin.service';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
        @InjectRepository(BankAccount)
        private bankAccountRepository: Repository<BankAccount>,
        @InjectRepository(BankTransaction)
        private transactionRepository: Repository<BankTransaction>,
        private gremlinService: GremlinService
    ) {}

    async onModuleInit() {
        if (process.env.SEED_DB === 'true') {
            await this.seed();
        }
    }

    async seed() {
        const count = await this.personRepository.count();
        if (count > 0) {
            this.logger.log('Database already seeded, skipping');
            return;
        }
        
        const persons = await this.seedPersons();

        const accounts = await this.seedBankAccounts(persons);

        await this.seedTransactions(accounts);

        await this.seedFriendships(persons);
    }

    async seedPersons() {
        this.logger.log('Seeding persons');

        const personData = [
            {name: 'John Doe', email: 'john@example.com', isActive: true},
            {name: 'Jane Smith', email: 'jane@example.com', isActive: true},
            {name: 'Alice Johnson', email: 'alice@example.com', isActive: true},
            {name: 'Bob Brown', email: 'bob@example.com', isActive: true},
            {name: 'Charlie Davis', email: 'charlie@example.com', isActive: true},
            {name: 'Diana Evans', email: 'diana@example.com', isActive: true},
            {name: 'Edward Franklin', email: 'edward@example.com', isActive: true}
        ];

        const persons: Person[] = [];

        for (const data of personData) {
            const person = this.personRepository.create(data);
            const savedPerson = await this.personRepository.save(person);
            persons.push(savedPerson);

            await this.gremlinService.addPersonVertex(savedPerson.id, {
                name: savedPerson.name,
                email: savedPerson.email!
            });
        }

        return persons;
    }

    async seedBankAccounts(persons) {
        this.logger.log('Seeding bank accounts');

        const accounts: BankAccount[] = [];

        for (const person of persons) {
            const numAccounts = 2 + Math.floor(Math.random() * 2);

            for (let i = 0; i < numAccounts; i++) {
                const bankNames = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One'];
                const randomBank = bankNames[Math.floor(Math.random() * bankNames.length)];

                const account = this.bankAccountRepository.create({
                    iban: `IBAN${Math.random().toString(36).substring(2, 12)}`,
                    bankName: randomBank,
                    person: person
                });

                const savedAccount = await this.bankAccountRepository.save(account);
                accounts.push(savedAccount);
            }
        }

        return accounts;
    }

    async seedTransactions(accounts: BankAccount[]): Promise<void> {
        this.logger.log('Seeding transactions');

        for (const account of accounts) {
            await this.createRandomTransactionsForAccount(account, 5 + Math.floor(Math.random() * 6));
        }
    }

    private async createRandomTransactionsForAccount(account: BankAccount, count: number): Promise<void> {
        const descriptions = [
            'Salary', 'Rent', 'Groceries', 'Utilities',
            'Restaurant', 'Shopping', 'Transportation'
        ];

        for (let i = 0; i < count; i++) {
            const isPositive = Math.random() > 0.3;
            const amount = isPositive
                ? 100 + Math.floor(Math.random() * 900)
                : -(50 + Math.floor(Math.random() * 450));

            const transaction = this.transactionRepository.create({
                amount: amount,
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                bankAccount: account,
                processed_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
            });

            await this.transactionRepository.save(transaction);
        }
    }

    async seedFriendships(persons) {
        this.logger.log('Seeding friendships');

        const friendshipPairs = [
            [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [1, 4]
        ];

        for (const [idx1, idx2] of friendshipPairs) {
            if (idx1 < persons.length && idx2 < persons.length) {
                await this.gremlinService.addFriendship(persons[idx1].id, persons[idx2].id);
            }
        }
    }
}