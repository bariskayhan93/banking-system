import {Controller, Get, Post, Body, Query} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {BankTransactionService} from './bank-transaction.service';
import {CreateBankTransactionDto} from './dto/create-bank-transaction.dto';
import {BankTransactionResponseDto} from './dto/bank-transaction-response.dto';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('bank-transactions')
@Controller('bank-transactions')
export class BankTransactionController {
    constructor(private readonly service: BankTransactionService) {}

    @Post()
    @ApiOperation({summary: 'Create a new bank transaction'})
    @ApiCreatedResponse(BankTransactionResponseDto, 'Transaction successfully created')
    @ApiBadRequestResponse('Invalid input data')
    @ApiNotFoundResponse('Bank account not found')
    async create(
        @Body() dto: CreateBankTransactionDto
    ): Promise<BankTransactionResponseDto> {
        const transaction = await this.service.create(dto);
        return new BankTransactionResponseDto(transaction);
    }

    @Get()
    @ApiOperation({summary: 'Get all bank transactions or filter by account'})
    @ApiQuery({
        name: 'iban',
        description: 'Filter transactions by bank account IBAN',
        required: false,
        type: String,
    })
    @ApiOkResponse(BankTransactionResponseDto, 'List of bank transactions', true)
    @ApiNotFoundResponse('Bank account not found if IBAN is provided')
    async findAll(@Query('iban') iban?: string): Promise<BankTransactionResponseDto[]> {
        const transactions = iban
            ? await this.service.findByIban(iban)
            : await this.service.findAll();
        return transactions.map(tx => new BankTransactionResponseDto(tx));
    }
}
