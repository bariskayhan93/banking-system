import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Person } from '../person/entities/person.entity';
import { PersonService } from '../person/person.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankTransactionService } from '../bank-transaction/bank-transaction.service';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { SEED_CONFIG } from '../../common/config/seed.config';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly personService: PersonService,
    private readonly bankAccountService: BankAccountService,
    private readonly bankTransactionService: BankTransactionService,
    private readonly gremlinService: GremlinService,
  ) {}

  async onModuleInit(): Promise<void> {
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
    await this.entityManager.query(
      'TRUNCATE TABLE "bank_transactions", "bank_accounts", "persons" RESTART IDENTITY CASCADE',
    );
    await this.seed();
    this.logger.log('--- Database Reset and Reseed Completed Successfully ---');
  }

  async seed(): Promise<void> {
    const isSeeded = await this.checkIfSeeded();
    if (isSeeded) {
      this.logger.log('Database already seeded, skipping.');
      return;
    }

    this.logger.log('--- Starting Database Seeding ---');

    this.logger.log('Step 1: Seeding persons...');
    const persons = await this.seedPersons(SEED_CONFIG.DEFAULT_PERSON_COUNT);

    this.logger.log('Step 2: Seeding bank accounts and initial deposits...');
    await this.seedBankAccountsAndDeposits(SEED_CONFIG.MAX_ACCOUNTS_PER_PERSON, persons);

    this.logger.log('Step 3: Seeding additional random transactions...');
    await this.seedRandomTransactions(SEED_CONFIG.MAX_TRANSACTIONS_PER_ACCOUNT);

    this.logger.log('Step 4: Seeding friendships...');
    await this.seedFriendships(persons);

    this.logger.log('--- Database Seeding Completed Successfully ---');
  }

  private async seedPersons(count: number = SEED_CONFIG.DEFAULT_PERSON_COUNT): Promise<Person[]> {
    const names = SEED_CONFIG.DEFAULT_PERSON_NAMES;

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
      } catch (error) {
        this.logger.error(`Failed to create person ${names[i]}: ${error.message}`);
      }
    }

    this.logger.log(`Created ${createdPersons.length} persons`);
    return createdPersons;
  }

  private async seedBankAccountsAndDeposits(
    maxAccountsPerPerson: number,
    persons: Person[],
  ): Promise<void> {
    if (persons.length === 0) {
      this.logger.warn('No persons found to create bank accounts for');
      return;
    }

    const bankNames = SEED_CONFIG.BANK_NAMES;
    const ibanPrefixes = SEED_CONFIG.IBAN_PREFIXES;
    let accountsCreated = 0;

    for (const person of persons) {
      const numAccounts = 1 + Math.floor(Math.random() * maxAccountsPerPerson);

      for (let i = 0; i < numAccounts; i++) {
        const randomBank = bankNames[Math.floor(Math.random() * bankNames.length)];
        const prefix = ibanPrefixes[Math.floor(Math.random() * ibanPrefixes.length)];
        const iban = `${prefix}${Math.floor(Math.random() * 10000000000)
          .toString()
          .padStart(10, '0')}`;

        try {
          const account = await this.bankAccountService.create({
            iban: iban,
            bankName: randomBank,
            personId: person.id,
          });

          const initialBalance =
            (i + 1) * SEED_CONFIG.INITIAL_BALANCE_BASE +
            Math.floor(Math.random() * SEED_CONFIG.INITIAL_BALANCE_RANDOM_RANGE);
          await this.bankTransactionService.create({
            iban: account.iban,
            amount: initialBalance,
            description: 'Initial deposit',
            otherIban: 'SYSTEM',
          });

          accountsCreated++;
        } catch (error) {
          this.logger.error(`Failed to create account: ${error.message}`);
        }
      }
    }

    this.logger.log(`Created ${accountsCreated} bank accounts with initial deposits`);
  }

  private async seedRandomTransactions(maxPerAccount: number): Promise<void> {
    const accounts = await this.bankAccountService.findAll();
    if (accounts.length === 0) {
      this.logger.warn('No bank accounts found to create transactions for');
      return;
    }

    const descriptions = SEED_CONFIG.TRANSACTION_DESCRIPTIONS;

    let transactionsCreated = 0;

    for (const account of accounts) {
      const transactionsCount = 1 + Math.floor(Math.random() * maxPerAccount);

      for (let i = 0; i < transactionsCount; i++) {
        // Based on configured debit probability
        const isDebit = Math.random() < SEED_CONFIG.DEBIT_PROBABILITY;
        const amount = isDebit
          ? -(
              SEED_CONFIG.MIN_TRANSACTION_AMOUNT +
              Math.floor(Math.random() * SEED_CONFIG.MAX_DEBIT_AMOUNT)
            )
          : SEED_CONFIG.MIN_CREDIT_AMOUNT +
            Math.floor(Math.random() * SEED_CONFIG.MAX_CREDIT_AMOUNT);

        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        try {
          await this.bankTransactionService.create({
            iban: account.iban,
            amount: amount,
            description: description,
            otherIban: isDebit ? 'MERCHANT' : 'DEPOSIT',
          });
          transactionsCreated++;
        } catch (error) {
          this.logger.error(`Failed to create transaction: ${error.message}`);
        }
      }
    }

    this.logger.log(`Created ${transactionsCreated} random transactions`);
  }

  private async seedFriendships(persons: Person[]): Promise<void> {
    if (persons.length < 2) {
      this.logger.warn('Not enough persons to create friendships');
      return;
    }

    let friendshipsCreated = 0;

    // Create a small-world network where each person has 2-4 friends
    for (let i = 0; i < persons.length; i++) {
      const personId = persons[i].id;
      const friendCount =
        SEED_CONFIG.MIN_FRIENDS_PER_PERSON +
        Math.floor(
          Math.random() *
            (SEED_CONFIG.MAX_FRIENDS_PER_PERSON - SEED_CONFIG.MIN_FRIENDS_PER_PERSON + 1),
        );

      for (let j = 0; j < friendCount; j++) {
        // Pick a random friend that isn't self
        let friendIndex;
        do {
          friendIndex = Math.floor(Math.random() * persons.length);
        } while (friendIndex === i);

        const friendId = persons[friendIndex].id;

        try {
          const exists = await this.gremlinService.friendshipExists(personId, friendId);
          if (!exists) {
            await this.personService.addFriend(personId, friendId);
            friendshipsCreated++;
          }
        } catch (error) {
          this.logger.error(`Failed to create friendship: ${error.message}`);
        }
      }
    }

    this.logger.log(`Created ${friendshipsCreated} friendships`);
  }
}
