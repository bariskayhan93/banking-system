import {
    Controller,
    Get,
    Post,
    Body,
    HttpStatus,
    Logger,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
} from '@nestjs/swagger';
import { BankTransactionService } from './bank-transaction.service';
import { CreateBankTransactionDto } from './dto/create-bank-transaction.dto';
import { BankTransactionResponseDto } from './dto/bank-transaction-response.dto';

@ApiTags('bank-transactions')
@Controller('bank-transactions')
export class BankTransactionController {
    private readonly logger = new Logger(BankTransactionController.name);

    constructor(private readonly service: BankTransactionService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new bank transaction' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Transaction successfully created',
        type: BankTransactionResponseDto
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Bank account not found' })
    async create(@Body() dto: CreateBankTransactionDto): Promise<BankTransactionResponseDto> {
        const transaction = await this.service.create(dto);
        return new BankTransactionResponseDto(transaction);
    }

    @Get()
    @ApiOperation({ summary: 'Get all bank transactions or filter by account IBAN' })
    @ApiQuery({
        name: 'iban',
        description: 'Filter transactions by bank account IBAN',
        required: false,
        type: String,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of bank transactions',
        type: [BankTransactionResponseDto]
    })
    @ApiNotFoundResponse({ description: 'Bank account not found if IBAN is provided and invalid' })
    async findAll(@Query('iban') iban?: string): Promise<BankTransactionResponseDto[]> {
        const transactions = iban ? await this.service.findByIban(iban) : await this.service.findAll();
        return transactions.map(tx => new BankTransactionResponseDto(tx));
    }
}
