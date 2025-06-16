import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, In, Index, JoinColumn, CreateDateColumn,
} from 'typeorm';
import {BankAccount} from "../../bank-account/bank-account.entity";

@Entity()
export class BankTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('numeric', {precision: 15, scale: 2})
    amount: number;

    @Column({nullable: true})
    description?: string;

    @ManyToOne(() => BankAccount, (account) => account.transactions, {onDelete: 'CASCADE'})
    @JoinColumn({ name: 'iban' })
    bankAccount: BankAccount;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    processed_at: Date;
}
