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

@Controller('bank-account')
export class BankAccountController {
    constructor(private readonly service: BankAccountService) {
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Post()
    create(@Body() dto: CreateBankAccountDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto) {
        return this.service.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
