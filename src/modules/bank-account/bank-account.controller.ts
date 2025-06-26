import { Controller, Get, Post, Body, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountController {
  constructor(private readonly service: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiCreatedResponse(BankAccountResponseDto, 'Bank account successfully created')
  @ApiBadRequestResponse('Invalid input data')
  @ApiNotFoundResponse('Person not found')
  @ApiConflictResponse('Bank account with this IBAN already exists')
  async create(@Body() dto: CreateBankAccountDto): Promise<BankAccountResponseDto> {
    const account = await this.service.create(dto);
    return new BankAccountResponseDto(account);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts or filter by person' })
  @ApiOkResponse(BankAccountResponseDto, 'List of bank accounts', true)
  @ApiQuery({
    name: 'personId',
    description: 'Filter accounts by person ID',
    required: false,
    type: String,
  })
  @ApiBadRequestResponse('Invalid UUID format for personId')
  async findAll(
    @Query('personId', new ParseUUIDPipe({ version: '4', optional: true }))
    personId?: string,
  ): Promise<BankAccountResponseDto[]> {
    const accounts = personId
      ? await this.service.findByPersonId(personId)
      : await this.service.findAll();
    return accounts.map(account => new BankAccountResponseDto(account));
  }

  @Get(':iban')
  @ApiOperation({ summary: 'Get a bank account by IBAN' })
  @ApiParam({ name: 'iban', description: 'Bank account IBAN' })
  @ApiOkResponse(BankAccountResponseDto, 'Bank account found')
  @ApiNotFoundResponse('Bank account not found')
  async findOne(@Param('iban') iban: string): Promise<BankAccountResponseDto> {
    const account = await this.service.findOne(iban);
    return new BankAccountResponseDto(account);
  }

  @Delete(':iban')
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiParam({ name: 'iban', description: 'Bank account IBAN' })
  @ApiNoContentResponse('Bank account deleted')
  @ApiNotFoundResponse('Bank account not found')
  async remove(@Param('iban') iban: string): Promise<void> {
    return this.service.remove(iban);
  }
}
