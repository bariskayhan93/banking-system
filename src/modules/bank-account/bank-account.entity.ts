import {Entity, Column, ManyToOne, OneToMany, PrimaryColumn} from 'typeorm';
import {Person} from '../person/entities/person.entity';
import {BankTransaction} from "../bank-transaction/entities/bank-transaction.entity";

@Entity()
export class BankAccount {
    @PrimaryColumn()
    iban: string;

    @Column()
    bankName: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    balance: number;

    @ManyToOne(() => Person, (person) => person.bankAccounts, {onDelete: 'CASCADE'})
    person: Person;
    
    @OneToMany(() => BankTransaction, (tx) => tx.bankAccount, {cascade: true})
    transactions: BankTransaction[];
}
