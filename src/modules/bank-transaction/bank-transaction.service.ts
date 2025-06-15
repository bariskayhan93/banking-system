import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateBankTransactionDto} from './dto/create-bank-transaction.dto';
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {BankTransaction} from "./entities/bank-transaction.entity";
import {BankAccount} from "../bank-account/bank-account.entity";

@Injectable()
export class BankTransactionService {
    constructor(
        @InjectRepository(BankTransaction)
        private readonly txRepo: Repository<BankTransaction>,
        @InjectRepository(BankAccount)
        private readonly bankAccountRepo: Repository<BankAccount>,
    ) {}

    async create(dto: CreateBankTransactionDto) {
        const bankAccount = await this.bankAccountRepo.findOneBy({ iban: dto.iban });
        if (!bankAccount) {
            throw new NotFoundException(`Bank account with IBAN ${dto.iban} not found.`);
        }

        const transaction = this.txRepo.create({
            amount: dto.amount,
            description: dto.description,
            bankAccount: bankAccount,
        });

        return this.txRepo.save(transaction);
    }

    findAll() {
        return this.txRepo.find({relations: ['bankAccount']});
    }

    async findOne(id: string) {
        const transaction = await this.txRepo.findOne({
            where: {id},
            relations: ['bankAccount'],
        });
        if (!transaction) throw new NotFoundException('BankTransaction not found');
        return transaction;
    }
    
    async update(id: string, dto: Partial<CreateBankTransactionDto>) {
        const existing = await this.findOne(id);
        Object.assign(existing, dto);
        return this.txRepo.save(existing);
    }

    async remove(id: string) {
        const existing = await this.findOne(id);
        return this.txRepo.remove(existing);
    }
}
