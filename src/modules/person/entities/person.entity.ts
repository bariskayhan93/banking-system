import {Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {BankAccount} from '../../bank-account/entities/bank-account.entity';

/**
 * Person entity representing users in the banking system
 */
@Entity('persons')
export class Person {
    @ApiProperty({
        example: '1f8e7a3c-9d4b-5c6a-8b2f-1e9d7f3a2c5b'
    })
    @PrimaryColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Alice Johnson'
    })
    @Column({length: 100})
    name: string;

    @ApiProperty({
        example: 'alice@example.com'
    })
    @Column({length: 255, unique: true})
    email: string;

    @ApiProperty({
        example: 15000.50
    })
    @Column('decimal', {precision: 15, scale: 2, default: 0})
    netWorth: number;

    @ApiProperty({type: () => [BankAccount]})
    @OneToMany(() => BankAccount, account => account.person)
    bankAccounts: BankAccount[];

    @CreateDateColumn({type: 'timestamptz'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt: Date;
}