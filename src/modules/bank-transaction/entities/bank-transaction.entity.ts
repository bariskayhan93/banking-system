import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from "../../bank-account/entities/bank-account.entity";

@Entity('bank_transactions')
export class BankTransaction {
    @ApiProperty({
        description: 'Unique identifier for the transaction',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Transaction amount (positive for credit, negative for debit)',
        example: 120.50
    })
    @Column('numeric', { precision: 15, scale: 2 })
    amount: number;

    @ApiProperty({
        description: 'IBAN of the other party involved in the transaction',
        example: 'FR7630006000011234567890189',
        required: false
    })
    @Column({ nullable: true })
    otherIban?: string;

    @ApiProperty({
        description: 'Optional description of the transaction',
        example: 'Monthly salary payment',
        required: false
    })
    @Column({ nullable: true })
    description?: string;

    @ApiProperty({
        description: 'Flag indicating if the transaction has been processed in a balance update',
        example: false,
        default: false
    })
    @Column({ default: false })
    processed: boolean;

    @ApiProperty({
        description: 'Reference to the bank account',
        type: () => BankAccount
    })
    @ManyToOne(() => BankAccount, (account) => account.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'iban' })
    bankAccount: BankAccount;

    @ApiProperty({
        description: 'When the transaction was created',
        example: '2025-06-22T10:30:00Z'
    })
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ApiProperty({
        description: 'When the transaction was last updated',
        example: '2025-06-22T23:05:30Z'
    })
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
