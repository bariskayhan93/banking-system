import { Injectable } from '@nestjs/common';
import { Person } from '../../person/entities/person.entity';
import { FriendLoanContribution } from '../dto/loan-potential.dto';
import { DEFAULT_LOAN_CONFIG } from '../../../common/config/loan.config';

export interface LoanCalculationResult {
  totalAmount: number;
  contributions: FriendLoanContribution[];
  method: 'PERCENTAGE_BASED' | 'DIFFERENCE_BASED';
}

@Injectable()
export class LoanCalculatorService {
  private readonly config = DEFAULT_LOAN_CONFIG;

  calculateLoanPotential(person: Person, friends: Person[]): LoanCalculationResult {
    const personNetWorth = Number(person.netWorth);

    // Handle case where person has no friends
    if (!friends.length) {
      return this.createEmptyResult();
    }

    const contributions: FriendLoanContribution[] = [];
    let totalAmount = 0;

    for (const friend of friends) {
      const friendNetWorth = Number(friend.netWorth);

      // Only friends with higher net worth can lend
      if (friendNetWorth <= personNetWorth) continue;

      const contribution = this.calculateFriendContribution(friend, friendNetWorth, personNetWorth);

      if (contribution.maxLoanFromFriend > 0) {
        contributions.push(contribution);
        totalAmount += contribution.maxLoanFromFriend;
      }
    }

    // Handle case where person has friends but none are wealthy enough to lend
    if (!contributions.length) {
      return this.createEmptyResult();
    }

    contributions.sort((a, b) => b.maxLoanFromFriend - a.maxLoanFromFriend);

    return {
      totalAmount: Number(totalAmount.toFixed(2)),
      contributions,
      method: this.config.usePercentageMethod ? 'PERCENTAGE_BASED' : 'DIFFERENCE_BASED',
    };
  }

  private calculateFriendContribution(
    friend: Person,
    friendNetWorth: number,
    personNetWorth: number,
  ): FriendLoanContribution {
    const loanAmount = this.config.usePercentageMethod
      ? this.calculatePercentageBased(friendNetWorth)
      : this.calculateDifferenceBased(friendNetWorth, personNetWorth);

    const cappedAmount = Math.min(loanAmount, this.config.maxLoanPerFriend);

    return {
      friendId: friend.id,
      friendName: friend.name,
      friendNetWorth,
      maxLoanFromFriend: Number(cappedAmount.toFixed(2)),
      lendingPercentage: this.config.usePercentageMethod
        ? this.config.lendingPercentage
        : Number(((cappedAmount / friendNetWorth) * 100).toFixed(2)),
    };
  }

  private calculatePercentageBased(friendNetWorth: number): number {
    return (friendNetWorth * this.config.lendingPercentage) / 100;
  }

  private calculateDifferenceBased(friendNetWorth: number, personNetWorth: number): number {
    return friendNetWorth - personNetWorth;
  }

  private createEmptyResult(): LoanCalculationResult {
    return {
      totalAmount: 0,
      contributions: [],
      method: this.config.usePercentageMethod ? 'PERCENTAGE_BASED' : 'DIFFERENCE_BASED',
    };
  }
}
