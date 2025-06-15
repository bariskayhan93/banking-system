import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm';
import {Person} from '../person/person.entity';
import {BankTransaction} from "../bank-transaction/entities/bank-transaction.entity";

@Entity()
export class BankAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    iban: string;

    @Column()
    bankName: string;

    @ManyToOne(() => Person, (person) => person.bankAccounts, {onDelete: 'CASCADE'})
    person: Person;
    
    @OneToMany(() => BankTransaction, (tx) => tx.bankAccount, {cascade: true})
    transactions: BankTransaction[];
}
