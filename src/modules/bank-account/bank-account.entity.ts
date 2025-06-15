import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {Person} from '../person/person.entity';

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
}
