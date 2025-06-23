import { Injectable, Logger } from '@nestjs/common';
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

    async updateAccountBalances(): Promise<void> {
        this.logger.log('Starting Process 1: Update account balances');
        await this.bankProcessRepo.updateAccountBalances();
        this.logger.log('Process 1 completed');
    }

    async calculateNetWorths(): Promise<void> {
        this.logger.log('Starting Process 2: Calculate net worths');
        await this.bankProcessRepo.calculateNetWorths();
        this.logger.log('Process 2 completed');
    }

    async getLoanPotentialForPerson(personId: string): Promise<LoanPotentialDto> {
        this.logger.log(`Calculating loan potential for person: ${personId}`);
        const person = await this.personRepo.findById(personId, ['bankAccounts']);
        const friendIds = await this.gremlinService.findFriendIds(personId);

        if (friendIds.length === 0) {
            return { personId, maxLoanAmount: 0 };
        }

        const friends = await this.personRepo.findByIds(friendIds);
        const maxLoanAmount = friends.reduce((total, friend) => {
            if (friend.netWorth > person.netWorth) {
                total += Number(friend.netWorth) - Number(person.netWorth);
            }
            return total;
        }, 0);

        return { personId, maxLoanAmount: Number(maxLoanAmount.toFixed(2)) };
    }

    async handleProcess(processId: number): Promise<any> {
        this.logger.log(`Handling process request with processId: ${processId}`);
        
        if (processId >= 1) {
            await this.updateAccountBalances();
        }

        if (processId >= 2) {
            await this.calculateNetWorths();
        }

        if (processId >= 3) {
            // This is a placeholder. In a real scenario, you might want to 
            // calculate and store loan potentials for all users.
            this.logger.log('Process 3 completed: Loan potential calculation would run here.');
        }

        return { message: `Processes up to ${processId} completed successfully.` };
    }
}