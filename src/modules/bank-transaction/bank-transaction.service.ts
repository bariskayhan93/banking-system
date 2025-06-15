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
        private readonly accountRepo: Repository<BankAccount>,
    ) {
    }

    async create(dto: CreateBankTransactionDto) {
        const account = await this.accountRepo.findOneBy({iban: dto.iban});
      if (!account) throw new NotFoundException(`Bank account with IBAN ${dto.iban} not found`);

      const {amount, description, iban, createdAt} = dto;

        const transaction = this.txRepo.create({
            amount,
            description,
            iban,
            bankAccount: account,
            createdAt: new Date(createdAt ?? Date.now()),
        });

        return this.txRepo.save(transaction);
    }

    findAll() {
        return this.txRepo.find({relations: ['bankAccount']});
    }

    async findOne(id: number) {
        const tx = await this.txRepo.findOne({
            where: {id},
            relations: ['bankAccount'],
        });
        if (!tx) throw new NotFoundException('Transaction not found');
        return tx;
    }

  async update(id: number, dto: Partial<CreateBankTransactionDto>) {
    const tx = await this.findOne(id);
    const updated = Object.assign(tx, dto);
    return this.txRepo.save(updated);
  }

    async remove(id: number) {
        const tx = await this.findOne(id);
        return this.txRepo.remove(tx);
    }
}
