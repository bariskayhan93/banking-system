import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
} from '@nestjs/common';
import {BankAccountService} from './bank-account.service';
import {CreateBankAccountDto} from './dto/create-bank-account.dto';
import {UpdateBankAccountDto} from './dto/update-bank-account.dto';

@Controller('bank-accounts')
export class BankAccountController {
    constructor(private readonly service: BankAccountService) {
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':iban')
    findOne(@Param('iban') iban: string) {
        return this.service.findOne(iban);
    }

    @Post()
    create(@Body() dto: CreateBankAccountDto) {
        return this.service.create(dto);
    }

    @Put(':iban')
    update(@Param('iban') iban: string, @Body() dto: UpdateBankAccountDto) {
        return this.service.update(iban, dto);
    }

    @Delete(':iban')
    remove(@Param('iban') iban: string) {
        return this.service.remove(iban);
    }
}
