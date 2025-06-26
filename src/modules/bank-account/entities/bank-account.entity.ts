import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../person/entities/person.entity';
import { BankTransaction } from '../../bank-transaction/entities/bank-transaction.entity';

/**
 * Bank account entity representing financial accounts in the system
 */
@Entity('bank_accounts')
@Index(['balance'])
@Index(['person'])
export class BankAccount {
  @ApiProperty({
    description: 'International Bank Account Number',
    example: 'DE89370400440532013000',
  })
  @PrimaryColumn({ length: 34 })
  iban: string;

  @ApiProperty({
    description: 'Name of the bank',
    example: 'Deutsche Bank',
  })
  @Column({ length: 100 })
  bankName: string;

  @ApiProperty({
    description: 'Current account balance',
    example: 1250.75,
  })
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ type: () => Person })
  @ManyToOne(() => Person, person => person.bankAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @ApiProperty({ type: () => [BankTransaction] })
  @OneToMany(() => BankTransaction, tx => tx.bankAccount)
  transactions: BankTransaction[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
