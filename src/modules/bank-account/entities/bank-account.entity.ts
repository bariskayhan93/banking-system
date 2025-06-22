import { Entity, Column, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Person } from "../../person/entities/person.entity";
import { BankTransaction } from "../../bank-transaction/entities/bank-transaction.entity";

@Entity('bank_accounts')
export class BankAccount {
    @ApiProperty({
        description: 'International Bank Account Number - Primary identifier',
        example: 'DE89370400440532013000'
    })
    @PrimaryColumn({ length: 34 })
    iban: string;

    @ApiProperty({
        description: 'Name of the bank',
        example: 'Deutsche Bank'
    })
    @Column({ length: 100 })
    bankName: string;

    @ApiProperty({
        description: 'Current account balance',
        example: 1250.75
    })
    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    balance: number;

    @ManyToOne(() => Person, (person) => person.bankAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'person_id' })
    person: Person;

    @ApiProperty({
        description: 'List of transactions associated with this account',
        type: [BankTransaction]
    })
    @OneToMany(() => BankTransaction, (tx) => tx.bankAccount, { cascade: true })
    transactions: BankTransaction[];
}
