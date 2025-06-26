import { Injectable, Logger } from '@nestjs/common';
import { BankProcessRepository } from './repositories/bank-process.repository';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { PersonRepository } from '../person/repositories/person.repository';
import { LoanPotentialDto } from './dto/loan-potential.dto';
import { ProcessResponseDto } from './dto/process-response.dto';
import { Person } from '../person/entities/person.entity';
import { LoanCalculatorService } from './services/loan-calculator.service';
import { DEFAULT_LOAN_CONFIG } from '../../common/config/loan.config';

@Injectable()
export class BankProcessService {
  private readonly logger = new Logger(BankProcessService.name);

  constructor(
    private readonly repository: BankProcessRepository,
    private readonly personRepository: PersonRepository,
    private readonly gremlinService: GremlinService,
    private readonly loanCalculator: LoanCalculatorService,
  ) {}

  async handleProcess(processId: number): Promise<ProcessResponseDto> {
    this.logger.log(`Handling process request with processId: ${processId}`);
    await this.runProcesses(processId);
    return { message: `Processes up to ${processId} completed successfully.` };
  }

  async getLoanPotentialForPerson(personId: string): Promise<LoanPotentialDto> {
    this.logger.log(`Calculating loan potential for person: ${personId}`);

    await this.runProcesses(2);
    const person = await this.personRepository.findById(personId);

    const friendIds = await this.gremlinService.findFriendIds(personId);
    const friends = friendIds.length > 0 ? await this.personRepository.findByIds(friendIds) : [];

    const calculation = this.loanCalculator.calculateLoanPotential(person, friends);

    return {
      personId,
      personNetWorth: Number(person.netWorth),
      maxLoanAmount: calculation.totalAmount,
      friendContributions: calculation.contributions,
      calculationMethod: calculation.method,
    };
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
    const personIds = allPersons.map(p => p.id);

    // Use bulk operation to get all friend networks at once
    const friendNetworksMap = await this.gremlinService.findMultipleFriendIds(personIds);

    // Get all unique friend IDs to minimize database queries
    const allFriendIds = new Set<string>();
    friendNetworksMap.forEach(friendIds => {
      friendIds.forEach(id => allFriendIds.add(id));
    });

    // Fetch all friends data in one query
    const allFriends =
      allFriendIds.size > 0 ? await this.personRepository.findByIds(Array.from(allFriendIds)) : [];
    const friendsMap = new Map(allFriends.map(friend => [friend.id, friend]));

    // Calculate loan potentials for all persons
    for (const person of allPersons) {
      const friendIds = friendNetworksMap.get(person.id) || [];
      const friends = friendIds
        .map(id => friendsMap.get(id))
        .filter((friend): friend is Person => friend !== undefined);
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
