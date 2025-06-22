import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Person } from '../person/entities/person.entity';
import { PersonService } from '../person/person.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankTransactionService } from '../bank-transaction/bank-transaction.service';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { BankAccount } from '../bank-account/entities/bank-account.entity';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly entityManager: EntityManager,
        @InjectRepository(Person)
        private readonly personRepository: Repository<Person>, // Kept for checkIfSeeded
        private readonly personService: PersonService,
        private readonly bankAccountService: BankAccountService,
        private readonly bankTransactionService: BankTransactionService,
        private readonly gremlinService: GremlinService,
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
        this.logger.log('--- Resetting Database and Reseeding ---');
        
        await this.gremlinService.clearGraph();

        await this.entityManager.query('TRUNCATE TABLE "bank_transactions", "bank_accounts", "persons" RESTART IDENTITY CASCADE');
        
        await this.seed();
        
        this.logger.log('--- Database Reset and Reseed Completed Successfully ---');
    }

    async seed() {
        const isSeeded = await this.checkIfSeeded();
        if (isSeeded) {
            this.logger.log('Database already seeded, skipping.');
            return;
        }

        this.logger.log('--- Starting Database Seeding ---');

        this.logger.log('Step 1: Seeding persons...');
        const persons = await this.seedPersons(7);
        this.logger.log(`Step 1 Complete: Seeded ${persons.length} persons.`);

        this.logger.log('Step 2: Seeding bank accounts and initial deposits...');
        await this.seedBankAccountsAndDeposits(3, persons);
        this.logger.log('Step 2 Complete: Bank accounts and deposits seeded.');

        this.logger.log('Step 3: Seeding additional random transactions...');
        await this.seedRandomTransactions(10);
        this.logger.log('Step 3 Complete: Additional transactions seeded.');

        this.logger.log('Step 4: Seeding friendships...');
        await this.seedFriendships(persons);
        this.logger.log('Step 4 Complete: Friendships seeded.');

        this.logger.log('--- Database Seeding Completed Successfully ---');
    }

    private async seedPersons(count: number = 7): Promise<Person[]> {
        this.logger.log(`Seeding ${count} persons`);

        const names = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown', 
                      'Charlie Davis', 'Diana Evans', 'Edward Franklin', 'Fiona Grant',
                      'George Harris', 'Hannah Irving', 'Ian Jackson', 'Julia King'];
        
        const createdPersons: Person[] = [];

        for (let i = 0; i < Math.min(count, names.length); i++) {
            const firstName = names[i].split(' ')[0].toLowerCase();
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 1000);
            const email = `${firstName}${timestamp}${randomSuffix}@example.com`;
            
            try {
                const person = await this.personService.create({
                    name: names[i],
                    email: email,
                });
                createdPersons.push(person);
                this.logger.debug(`Created person: ${person.name} (${person.id})`);
            } catch (error) {
                this.logger.error(`Failed to create person ${names[i]}: ${error.message}`);
            }
        }
        return createdPersons;
    }

    private async seedBankAccountsAndDeposits(maxAccountsPerPerson: number = 3, persons: Person[]): Promise<void> {
        if (persons.length === 0) {
            this.logger.warn('No persons found to create bank accounts for');
            return;
        }

        const bankNames = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One'];
        const ibanPrefixes = ['DE89', 'FR76', 'GB29', 'US12', 'CH93', 'ES91'];

        for (const person of persons) {
            const numAccounts = 1 + Math.floor(Math.random() * maxAccountsPerPerson);

            for (let i = 0; i < numAccounts; i++) {
                const randomBank = bankNames[Math.floor(Math.random() * bankNames.length)];
                const prefix = ibanPrefixes[Math.floor(Math.random() * ibanPrefixes.length)];
                const iban = `${prefix}${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;

                try {
                    const account = await this.bankAccountService.create({
                        iban: iban,
                        bankName: randomBank,
                        personId: person.id,
                    });
                    
                    const initialBalance = 1000 + Math.floor(Math.random() * 9000);
                    await this.bankTransactionService.create({
                        iban: account.iban,
                        amount: initialBalance,
                        description: 'Initial deposit',
                        otherIban: 'SYSTEM'
                    });

                    this.logger.debug(`Created account: ${account.iban} for person ${person.name}`);
                } catch (error) {
                    this.logger.error(`Failed to create account for person ${person.name}: ${error.message}`);
                }
            }
        }
    }

    private async seedRandomTransactions(maxPerAccount: number = 10): Promise<void> {
        const accounts = await this.bankAccountService.findAll();
        if (accounts.length === 0) {
            this.logger.warn('No bank accounts found to create transactions for');
            return;
        }

        for (const account of accounts) {
            const txCount = 2 + Math.floor(Math.random() * (maxPerAccount - 1));
            await this.createRandomTransactionsForAccount(account, txCount);
        }
    }

    private async seedFriendships(persons?: Person[]): Promise<void> {
        const personList = persons || await this.personService.findAll();
        if (personList.length < 2) {
            this.logger.warn('Not enough persons found to create friendships');
            return;
        }

        for (let i = 0; i < personList.length; i++) {
            const connectionsCount = 1 + Math.floor(Math.random() * 2);
            
            for (let j = 0; j < connectionsCount; j++) {
                let friendIndex;
                do {
                    friendIndex = Math.floor(Math.random() * personList.length);
                } while (friendIndex === i);
                
                try {
                    await this.personService.addFriend(personList[i].id, personList[friendIndex].id);
                    this.logger.debug(`Created friendship between ${personList[i].name} and ${personList[friendIndex].name}`);
                } catch (error) {
                    this.logger.warn(`Could not create friendship: ${error.message}`);
                }
            }
        }
    }


    private async createRandomTransactionsForAccount(account: BankAccount, count: number): Promise<void> {
        const descriptions = [
            'Salary', 'Rent', 'Groceries', 'Utilities',
            'Restaurant', 'Shopping', 'Transportation', 'Insurance',
            'Subscription', 'Gift', 'Entertainment', 'Education'
        ];
        
        const otherIbanPrefixes = ['DE89', 'FR76', 'GB29', 'US12', 'CH93', 'ES91'];

        for (let i = 0; i < count; i++) {
            const isPositive = Math.random() > 0.3;
            const amount = isPositive
                ? 100 + Math.floor(Math.random() * 900)
                : -(50 + Math.floor(Math.random() * 450));
                
            const prefix = otherIbanPrefixes[Math.floor(Math.random() * otherIbanPrefixes.length)];
            const otherIban = `${prefix}${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;
            
            try {
                await this.bankTransactionService.create({
                    iban: account.iban,
                    amount,
                    otherIban,
                    description: descriptions[Math.floor(Math.random() * descriptions.length)],
                });
            } catch (error) {
                this.logger.error(`Failed to create transaction for account ${account.iban}: ${error.message}`);
            }
        }
    }
}