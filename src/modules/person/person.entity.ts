import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {BankAccount} from "../bank-account/bank-account.entity";

@Entity()
export class Person {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({nullable: true})
    email?: string;

    @Column({default: true})
    isActive: boolean;
    
    @OneToMany(() => BankAccount, (bankAccount) => bankAccount.person)
    bankAccounts: BankAccount[];
}
