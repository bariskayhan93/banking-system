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
        SET "netWorth" = COALESCE((
          SELECT SUM(balance)
          FROM bank_accounts
          WHERE person_id = persons.id
        ), 0);
      `);
    });
  }
}
