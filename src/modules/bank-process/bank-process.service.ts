import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BankProcessRepository } from './repositories/bank-process.repository';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { PersonRepository } from '../person/repositories/person.repository';
import { LoanPotentialDto } from './dto/loan-potential.dto';

@Injectable()
export class BankProcessService {
    private readonly logger = new Logger(BankProcessService.name);

    constructor(
        private readonly bankProcessRepo: BankProcessRepository,
        private readonly personRepo: PersonRepository,
        private readonly gremlinService: GremlinService,
    ) {}

    /**
     * Process 1: Update account balances based on unprocessed transactions
     */
    async updateAccountBalances(): Promise<Map<string, number>> {
        this.logger.log('Starting Process 1: Update account balances');
        const accounts = await this.bankProcessRepo.findAccountsWithUnprocessedTransactions();
        if (accounts.length === 0) {
            this.logger.log('No accounts with unprocessed transactions found.');
            return new Map();
        }

        const balanceUpdates = new Map<string, number>();
        const processedTransactionIds: string[] = [];

        for (const account of accounts) {
            const newBalance = account.transactions.reduce(
                (sum, tx) => sum + Number(tx.amount),
                Number(account.balance),
            );
            balanceUpdates.set(account.iban, newBalance);
            account.transactions.forEach(tx => processedTransactionIds.push(tx.id));
        }

        await this.bankProcessRepo.updateAccountBalances(balanceUpdates);
        await this.bankProcessRepo.markTransactionsAsProcessed(processedTransactionIds);

        this.logger.log(`Process 1 completed: Updated ${balanceUpdates.size} accounts.`);
        return balanceUpdates;
    }

    /**
     * Process 2: Calculate net worths for all persons
     */
    async calculateNetWorths(): Promise<Map<string, number>> {
        this.logger.log('Starting Process 2: Calculate net worths');
        const personsWithNetWorth = await this.bankProcessRepo.getAllPersonsWithNetWorth();
        const netWorthMap = new Map<string, number>();
        personsWithNetWorth.forEach(p => {
            netWorthMap.set(p.person.id, p.netWorth);
        });
        this.logger.log(`Process 2 completed: Calculated net worth for ${netWorthMap.size} persons.`);
        return netWorthMap;
    }

    /**
     * Process 3: Calculate loan potentials for all persons
     */
    async calculateLoanPotentials(): Promise<LoanPotentialDto[]> {
        this.logger.log('Starting Process 3: Calculate loan potentials');
        const personsWithNetWorth = await this.bankProcessRepo.getAllPersonsWithNetWorth();
        const loanPotentials: LoanPotentialDto[] = [];

        for (const { person, netWorth } of personsWithNetWorth) {
            const friendIds = await this.gremlinService.findFriendIds(person.id);
            if (friendIds.length === 0) {
                loanPotentials.push({ personId: person.id, maxLoanAmount: 0 });
                continue;
            }

            const friendsNetWorthMap = await this.bankProcessRepo.getNetWorthForPersons(friendIds);
            let maxLoanAmount = 0;
            for (const friendId of friendIds) {
                const friendNetWorth = friendsNetWorthMap.get(friendId) || 0;
                if (friendNetWorth > netWorth) {
                    maxLoanAmount += (friendNetWorth - netWorth);
                }
            }
            loanPotentials.push({ personId: person.id, maxLoanAmount: Number(maxLoanAmount.toFixed(2)) });
        }
        this.logger.log(`Process 3 completed: Calculated loan potentials for ${loanPotentials.length} persons.`);
        return loanPotentials;
    }

    /**
     * Calculate loan potential for a specific person
     */
    async getLoanPotentialForPerson(personId: string): Promise<LoanPotentialDto> {
        this.logger.log(`Calculating loan potential for person: ${personId}`);
        const person = await this.personRepo.findById(personId);
        if (!person) {
            throw new NotFoundException(`Person with ID ${personId} not found`);
        }

        const netWorthMap = await this.bankProcessRepo.getNetWorthForPersons([personId]);
        const personNetWorth = netWorthMap.get(personId) || 0;

        const friendIds = await this.gremlinService.findFriendIds(personId);
        if (friendIds.length === 0) {
            return { personId, maxLoanAmount: 0 };
        }

        const friendsNetWorthMap = await this.bankProcessRepo.getNetWorthForPersons(friendIds);
        let maxLoanAmount = 0;
        for (const friendId of friendIds) {
            const friendNetWorth = friendsNetWorthMap.get(friendId) || 0;
            if (friendNetWorth > personNetWorth) {
                maxLoanAmount += (friendNetWorth - personNetWorth);
            }
        }

        return { personId, maxLoanAmount: Number(maxLoanAmount.toFixed(2)) };
    }

    /**
     * Handle a process request based on the processId
     * Process 1: Update account balances
     * Process 2: Calculate net worths (runs Process 1 first)
     * Process 3: Calculate loan potentials (runs Process 2 first)
     */
    async handleProcess(processId: number): Promise<any> {
        this.logger.log(`Handling process request with processId: ${processId}`);
        const results = {};

        // Process 1: Update account balances
        if (processId >= 1) {
            const balanceMap = await this.updateAccountBalances();
            results['process1'] = {
                name: 'Account Balance Updates',
                updatedAccounts: balanceMap.size,
                completed: true,
            };
        }

        // Process 2: Calculate net worths
        if (processId >= 2) {
            const netWorthMap = await this.calculateNetWorths();
            results['process2'] = {
                name: 'Net Worth Calculations',
                personsCalculated: netWorthMap.size,
                completed: true,
            };
        }

        // Process 3: Calculate loan potentials
        if (processId >= 3) {
            const loanPotentials = await this.calculateLoanPotentials();
            results['process3'] = {
                name: 'Loan Potential Calculations',
                potentialsCalculated: loanPotentials.length,
                loanPotentials,
                completed: true,
            };
            // If only process 3 was requested, just return the loan potentials
            if (processId === 3 && !results['process1'] && !results['process2']) {
                return loanPotentials;
            }
        }

        return results;
    }
}