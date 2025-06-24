import {Injectable, Logger} from '@nestjs/common';
import {EntityManager} from 'typeorm';

@Injectable()
export class BankProcessRepository {
    private readonly logger = new Logger(BankProcessRepository.name);

    constructor(private readonly entityManager: EntityManager) {}

    async updateAccountBalances(): Promise<void> {
        this.logger.log('Updating account balances');

        await this.entityManager.transaction(async manager => {
            // Update account balances from unprocessed transactions
            await manager.query(`
                UPDATE bank_accounts
                SET balance = balance + sub.total_amount FROM (
                    SELECT iban, SUM(amount) as total_amount
                    FROM bank_transactions
                    WHERE NOT processed
                    GROUP BY iban
                ) AS sub
                WHERE bank_accounts.iban = sub.iban;
            `);

            // Mark transactions as processed
            await manager.query(`
                UPDATE bank_transactions
                SET processed   = true,
                    "updatedAt" = NOW()
                WHERE NOT processed;
            `);
        });
    }

    async calculateNetWorths(): Promise<void> {
        this.logger.log('Calculating net worths');

        await this.entityManager.transaction(async manager => {
            await manager.query(`
                UPDATE persons
                SET "netWorth" = COALESCE(
                        (SELECT SUM(balance)
                         FROM bank_accounts
                         WHERE person_id = persons.id), 0
                                 );
            `);
        });
    }
}
