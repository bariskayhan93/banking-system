import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BankAccount } from "../../bank-account/entities/bank-account.entity";

/**
 * Bank transaction entity representing financial transfers in the system
 */
@Entity('bank_transactions')
export class BankTransaction {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 120.50
    })
    @Column('numeric', { precision: 15, scale: 2 })
    amount: number;

    @ApiProperty({
        example: 'FR7630006000011234567890189'
    })
    @Column({ nullable: true })
    otherIban?: string;

    @ApiProperty({
        example: 'Monthly salary payment'
    })
    @Column({ nullable: true })
    description?: string;

    @ApiProperty({
        example: false
    })
    @Column({ default: false })
    processed: boolean;

    @ApiProperty({ type: () => BankAccount })
    @ManyToOne(() => BankAccount, (account) => account.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'iban' })
    bankAccount: BankAccount;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
