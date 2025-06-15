import { PartialType } from '@nestjs/swagger';
import { CreateBankTransactionDto } from './create-bank-transaction.dto';

export class UpdateBankTransactionDto extends PartialType(CreateBankTransactionDto) {}
