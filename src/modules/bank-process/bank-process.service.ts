import {Injectable} from "@nestjs/common";
import {DataSource} from "typeorm";
import {BankAccount} from "../bank-account/bank-account.entity";
import {Person} from "../person/entities/person.entity";
import {Friendship} from "../person/entities/friendship.entity";
import {LoanPotential} from "./dto/loan-potential.dto";

@Injectable()
export class ProcessService {
    constructor(private readonly dataSource: DataSource) {}

    async handleProcess(processId: number) {
        if (processId >= 1) await this.updateAccountBalances();
        if (processId >= 2) await this.updatePersonNetWorths();
        if (processId >= 3) return this.calculateLoanPotentials();
    }

    private async updateAccountBalances() {
        const accountRepo = this.dataSource.getRepository(BankAccount);
        const accounts = await accountRepo
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.transactions', 'tx')
            .getMany();

        for (const account of accounts) {
            const balance = account.transactions.reduce(
                (sum, tx) => sum + Number(tx.amount),
                0,
            );
            await accountRepo.update(account.id, {balance});
        }

        console.log('Updated account balances.');
    }

    private async updatePersonNetWorths() {
        const personRepo = this.dataSource.getRepository(Person);
        const people = await personRepo
            .createQueryBuilder('person')
            .leftJoinAndSelect('person.bankAccounts', 'account')
            .getMany();

        for (const person of people) {
            const netWorth = person.bankAccounts.reduce(
                (sum, acc) => sum + Number(acc.balance),
                0,
            );
            await personRepo.update(person.id, {netWorth});
        }

        console.log('Updated person net worths.');
    }

    private async calculateLoanPotentials(): Promise<LoanPotential[]> {
        const personRepo = this.dataSource.getRepository(Person);
        const friendshipRepo = this.dataSource.getRepository(Friendship);

        const people = await personRepo.find();
        const friendships = await friendshipRepo
            .createQueryBuilder('f')
            .leftJoinAndSelect('f.person', 'p')
            .leftJoinAndSelect('f.friend', 'friend')
            .getMany();

        const result: LoanPotential[] = [];

        for (const person of people) {
            const friends = friendships
                .filter(f => f.person.id === person.id)
                .map(f => f.friend);

            const maxLoanAmount = friends.reduce((sum, friend) => {
                const diff = Number(friend.netWorth) - Number(person.netWorth);
                return diff > 0 ? sum + diff : sum;
            }, 0);

            result.push({personId: person.id, maxLoanAmount});
        }

        console.log('Calculated loan potentials.');
        return result;
    }
}