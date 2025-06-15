import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import {BankAccount} from "../../bank-account/bank-account.entity";

@Entity()
export class Person {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({nullable: true})
    email?: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    netWorth: number;

    @Column({default: true})
    isActive: boolean;
    
    @OneToMany(() => BankAccount, (bankAccount) => bankAccount.person)
    bankAccounts: BankAccount[];
}


