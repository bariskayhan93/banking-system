import {Controller, Get, Post, Body, Patch, Param, Delete} from '@nestjs/common';
import {BankTransactionService} from './bank-transaction.service';
import {CreateBankTransactionDto} from './dto/create-bank-transaction.dto';
import {UpdateBankTransactionDto} from './dto/update-bank-transaction.dto';

@Controller('bank-transaction')
export class BankTransactionController {
    constructor(private readonly bankTransactionService: BankTransactionService) {}

    @Post()
    create(@Body() createBankTransactionDto: CreateBankTransactionDto) {
        return this.bankTransactionService.create(createBankTransactionDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateBankTransactionDto>) {
        return this.bankTransactionService.update(+id, dto);
    }

    @Get()
    findAll() {
        return this.bankTransactionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankTransactionService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankTransactionService.remove(+id);
    }
}
