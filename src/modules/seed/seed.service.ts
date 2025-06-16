import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Person} from '../person/entities/person.entity';
import {BankTransaction} from '../bank-transaction/entities/bank-transaction.entity';
import {GremlinService} from '../gremlin/services/gremlin.service';
import {BankAccount} from "../bank-account/entities/bank-account.entity";

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

    async checkIfSeeded(): Promise<boolean> {
        const count = await this.personRepository.count();
        return count > 0;
    }

    async resetAndReseed(): Promise<void> {
        this.logger.log('Resetting database and reseeding');
        
        try {
            await this.gremlinService.clearAll();
        } catch (error) {
            this.logger.error('Error clearing Gremlin graph', error);
        }

        await this.transactionRepository.delete({});
        await this.bankAccountRepository.delete({});
        await this.personRepository.delete({});
        
        await this.seed();
        
        this.logger.log('Database reset and reseeded successfully');
    }

    async seed() {
        const isSeeded = await this.checkIfSeeded();
        if (isSeeded) {
            this.logger.log('Database already seeded, skipping');
            return;
        }
        
        const persons = await this.seedPersonsOnly();
        const accounts = await this.seedBankAccountsOnly(3, persons);
        await this.seedTransactionsOnly(10);
        await this.seedFriendshipsOnly(persons);
    }

    async seedPersonsOnly(count: number = 7): Promise<Person[]> {
        this.logger.log(`Seeding ${count} persons`);

        const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 
                      'Charlie Davis', 'Diana Evans', 'Edward Franklin', 'Fiona Grant',
                      'George Harris', 'Hannah Irving', 'Ian Jackson', 'Julia King'];
        
        const persons: Person[] = [];

        for (let i = 0; i < Math.min(count, names.length); i++) {
            const firstName = names[i].split(' ')[0].toLowerCase();
            const personData = {
                name: names[i],
                email: `${firstName}@example.com`,
                isActive: true
            };

            const person = this.personRepository.create(personData);
            const savedPerson = await this.personRepository.save(person);
            persons.push(savedPerson);

         //   await this.gremlinService.savePerson(savedPerson.id, {
         //       name: savedPerson.name,
         //       email: savedPerson.email!
         //   });
        }

        return persons;
    }

    async seedBankAccountsOnly(maxAccountsPerPerson: number = 3, specificPersons?: Person[]): Promise<BankAccount[]> {
        this.logger.log('Seeding bank accounts');

        const persons = specificPersons || await this.personRepository.find();
        if (persons.length === 0) {
            this.logger.warn('No persons found to create bank accounts for');
            return [];
        }

        const accounts: BankAccount[] = [];
        const bankNames = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One'];

        for (const person of persons) {
            const numAccounts = 1 + Math.floor(Math.random() * maxAccountsPerPerson);

            for (let i = 0; i < numAccounts; i++) {
                const randomBank = bankNames[Math.floor(Math.random() * bankNames.length)];
                const initialBalance = 1000 + Math.floor(Math.random() * 9000);

                const account = this.bankAccountRepository.create({
                    iban: `IBAN${Math.random().toString(36).substring(2, 12)}`,
                    bankName: randomBank,
                    balance: initialBalance,
                    person: person
                });

                const savedAccount = await this.bankAccountRepository.save(account);
                accounts.push(savedAccount);
            }
        }

        return accounts;
    }

    async seedTransactionsOnly(maxPerAccount: number = 10): Promise<number> {
        this.logger.log('Seeding transactions');

        const accounts = await this.bankAccountRepository.find();
        if (accounts.length === 0) {
            this.logger.warn('No bank accounts found to create transactions for');
            return 0;
        }

        let totalTransactions = 0;
        for (const account of accounts) {
            const txCount = 2 + Math.floor(Math.random() * (maxPerAccount - 1));
            await this.createRandomTransactionsForAccount(account, txCount);
            totalTransactions += txCount;
        }

        return totalTransactions;
    }

    async seedFriendshipsOnly(specificPersons?: Person[]): Promise<number> {
        this.logger.log('Seeding friendships');

        const persons = specificPersons || await this.personRepository.find();
        if (persons.length < 2) {
            this.logger.warn('Not enough persons found to create friendships');
            return 0;
        }

        let friendshipCount = 0;
        for (let i = 0; i < persons.length; i++) {
            const connectionsCount = 1 + Math.floor(Math.random() * 3);
            
            for (let j = 0; j < connectionsCount; j++) {
                let friendIndex;
                do {
                    friendIndex = Math.floor(Math.random() * persons.length);
                } while (friendIndex === i);
                
                await this.gremlinService.addFriend(persons[i].id, persons[friendIndex].id);
                friendshipCount++;
            }
        }

        return friendshipCount;
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
}