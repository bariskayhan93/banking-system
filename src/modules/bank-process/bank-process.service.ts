import {Injectable, Logger} from '@nestjs/common';
import {BankProcessRepository} from './repositories/bank-process.repository';
import {GremlinService} from '../gremlin/services/gremlin.service';
import {PersonRepository} from '../person/repositories/person.repository';
import {LoanPotentialDto} from './dto/loan-potential.dto';
import {ProcessResponseDto} from './dto/process-response.dto';
import {Person} from '../person/entities/person.entity';

@Injectable()
export class BankProcessService {
    private readonly logger = new Logger(BankProcessService.name);

    constructor(
        private readonly repository: BankProcessRepository,
        private readonly personRepository: PersonRepository,
        private readonly gremlinService: GremlinService,
    ) {}

    async handleProcess(processId: number): Promise<ProcessResponseDto> {
        this.logger.log(`Handling process request with processId: ${processId}`);
        await this.runProcesses(processId);
        return { message: `Processes up to ${processId} completed successfully.` };
    }

    async getLoanPotentialForPerson(personId: string): Promise<LoanPotentialDto> {
        this.logger.log(`Calculating loan potential for person: ${personId}`);
        
        const person = await this.personRepository.findById(personId);
        await this.runProcesses(2);

        const friendIds = await this.gremlinService.findFriendIds(personId);
        const friends = friendIds.length > 0 ? await this.personRepository.findByIds(friendIds) : [];

        const maxLoanAmount = this.calculateLoanAmount(person, friends);

        return {personId, maxLoanAmount: Number(maxLoanAmount.toFixed(2))};
    }

    private async runProcesses(maxProcessId: number): Promise<void> {
        if (maxProcessId >= 1) {
            await this.updateAccountBalances();
        }
        if (maxProcessId >= 2) {
            await this.calculateNetWorths();
        }
        if (maxProcessId >= 3) {
            await this.calculateAndStoreLoanPotentials();
        }
    }

    private async updateAccountBalances(): Promise<void> {
        this.logger.log('Starting Process 1: Update account balances');
        await this.repository.updateAccountBalances();
        this.logger.log('Process 1 completed');
    }

    private async calculateNetWorths(): Promise<void> {
        this.logger.log('Starting Process 2: Calculate net worths');
        await this.repository.calculateNetWorths();
        this.logger.log('Process 2 completed');
    }

    private async calculateAndStoreLoanPotentials(): Promise<void> {
        this.logger.log('Starting Process 3: Calculating and storing loan potentials');
        
        const allPersons = await this.personRepository.findAll();
        
        for (const person of allPersons) {
            const friendIds = await this.gremlinService.findFriendIds(person.id);
            const friends = friendIds.length > 0 ? await this.personRepository.findByIds(friendIds) : [];
            const loanAmount = this.calculateLoanAmount(person, friends);
            this.logger.log(`Loan potential for ${person.name}: ${loanAmount}`);
        }
        
        this.logger.log('Process 3 completed');
    }

    private calculateLoanAmount(person: Person, friends: Person[]): number {
        return friends.reduce((total, friend) => {
            if (Number(friend.netWorth) > Number(person.netWorth)) {
                total += Number(friend.netWorth) - Number(person.netWorth);
            }
            return total;
        }, 0);
    }
}