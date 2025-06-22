import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    HttpStatus,
    Logger,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiQuery,
    ApiConflictResponse,
} from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountController {
    private readonly logger = new Logger(BankAccountController.name);
    
    constructor(private readonly service: BankAccountService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new bank account' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Bank account successfully created',
        type: BankAccountResponseDto
    })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    @ApiNotFoundResponse({ description: 'Person not found' })
    @ApiConflictResponse({ description: 'Bank account with this IBAN already exists' })
    async create(@Body() dto: CreateBankAccountDto): Promise<BankAccountResponseDto> {
        const account = await this.service.create(dto);
        return new BankAccountResponseDto(account);
    }

    @Get()
    @ApiOperation({ summary: 'Get all bank accounts or filter by person ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of bank accounts',
        type: [BankAccountResponseDto]
    })
    @ApiQuery({
        name: 'personId',
        description: 'Filter accounts by person ID',
        required: false,
        type: String
    })
    @ApiBadRequestResponse({ description: 'Invalid UUID format for personId' })
    async findAll(@Query('personId', new ParseUUIDPipe({ version: '4', optional: true })) personId?: string): Promise<BankAccountResponseDto[]> {
        const accounts = personId ? await this.service.findByPersonId(personId) : await this.service.findAll();
        return accounts.map(account => new BankAccountResponseDto(account));
    }

    @Get(':iban')
    @ApiOperation({ summary: 'Get a bank account by IBAN' })
    @ApiParam({ name: 'iban', description: 'Bank account IBAN' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Bank account found',
        type: BankAccountResponseDto
    })
    @ApiNotFoundResponse({ description: 'Bank account not found' })
    async findOne(@Param('iban') iban: string): Promise<BankAccountResponseDto> {
        const account = await this.service.findOne(iban);
        return new BankAccountResponseDto(account);
    }

    @Delete(':iban')
    @ApiOperation({ summary: 'Delete a bank account' })
    @ApiParam({ name: 'iban', description: 'Bank account IBAN' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Bank account deleted'
    })
    @ApiNotFoundResponse({ description: 'Bank account not found' })
    async remove(@Param('iban') iban: string): Promise<void> {
        return this.service.remove(iban);
    }
}
