import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable()
export class BankProcessRepository {
  constructor(private readonly entityManager: EntityManager) {}

  async updateAccountBalances(): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.query(`
        UPDATE bank_accounts
        SET balance = balance + sub.total_amount
        FROM (
          SELECT iban, SUM(amount) as total_amount
          FROM bank_transactions
          WHERE NOT processed
          GROUP BY iban
        ) AS sub
        WHERE bank_accounts.iban = sub.iban;
      `);

      await transactionalEntityManager.query(`
        UPDATE bank_transactions
        SET processed = true, "updatedAt" = NOW()
        WHERE NOT processed;
      `);
    });
  }

  async calculateNetWorths(): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.query(`
        UPDATE persons
        SET "netWorth" = sub.total_balance
        FROM (
          SELECT p.id, SUM(ba.balance) as total_balance
          FROM persons p
          JOIN bank_accounts ba ON p.id = ba.person_id
          GROUP BY p.id
        ) AS sub
        WHERE persons.id = sub.id;
      `);
    });
  }
}
