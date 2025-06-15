import { Injectable } from '@nestjs/common';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { UpdateBankTransactionDto } from './dto/update-bank-transaction.dto';

@Injectable()
export class BankTransactionService {
  create(createBankTransactionDto: CreateBankTransactionDto) {
    return 'This action adds a new bankTransaction';
  }

  findAll() {
    return `This action returns all bankTransaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bankTransaction`;
  }

  update(id: number, updateBankTransactionDto: UpdateBankTransactionDto) {
    return `This action updates a #${id} bankTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} bankTransaction`;
  }
}
