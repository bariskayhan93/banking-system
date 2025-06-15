import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, In, Index,
} from 'typeorm';
import {BankAccount} from "../../bank-account/bank-account.entity";

@Entity()
export class BankTransaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index()
    iban: string;

    @Column('decimal', {precision: 12, scale: 2})
    amount: number;
    
    @Column({nullable: true})
    description?: string;

    @ManyToOne(() => BankAccount, (account) => account.transactions, {onDelete: 'CASCADE'})
    bankAccount: BankAccount;

    @Column()
    createdAt: Date;
}