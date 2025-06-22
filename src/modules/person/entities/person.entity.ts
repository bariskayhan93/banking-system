import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from '../../bank-account/entities/bank-account.entity';

/**
 * Person entity representing users in the banking system
 * This entity is stored in both PostgreSQL and the graph database
 */
@Entity('persons')
export class Person {
    @ApiProperty({
        description: 'Unique identifier for the person',
        example: '1f8e7a3c-9d4b-5c6a-8b2f-1e9d7f3a2c5b'
    })
    @PrimaryColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Full name of the person',
        example: 'Alice Johnson'
    })
    @Column({ length: 100 })
    name: string;

    @ApiProperty({
        description: 'Email address of the person',
        example: 'alice@example.com'
    })
    @Column({ length: 255, unique: true })
    email: string;

    @ApiProperty({
        description: 'Net worth of the person',
        example: 15000.50
    })
    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    netWorth: number;

    @ApiProperty({
        description: 'Bank accounts owned by this person',
        type: () => [BankAccount]
    })
    @OneToMany(() => BankAccount, bankAccount => bankAccount.person)
    bankAccounts: BankAccount[];
}