import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import {BankAccount} from "../../bank-account/bank-account.entity";

@Entity()
export class BankTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    counterpartyIban: string;

    @Column('decimal', {precision: 12, scale: 2})
    amount: number;

    @ManyToOne(() => BankAccount, (account) => account.transactions, {onDelete: 'CASCADE'})
    bankAccount: BankAccount;

    @Column()
    createdAt: Date;
}