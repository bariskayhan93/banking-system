import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BankProcessService } from './bank-process.service';
import { LoanPotentialDto } from './dto/loan-potential.dto';
import { ProcessDto } from './dto/process.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '../../common/decorators/api-response.decorator';
import { ProcessResponseDto } from './dto/process-response.dto';

@ApiTags('processes')
@Controller('processes')
export class BankProcessController {
  constructor(private readonly processService: BankProcessService) {}

  @Post()
  @ApiOperation({
    summary: 'Webhook endpoint for nightly processing',
    description:
      'Triggers banking processes based on the provided process ID. Higher process IDs automatically execute lower ones. Process 1: Update account balances. Process 2: Calculate net worths. Process 3: Calculate loan potentials.',
  })
  @ApiOkResponse(ProcessResponseDto, 'Processing succeeded')
  @ApiBadRequestResponse('Invalid request data')
  async process(@Body() body: ProcessDto): Promise<ProcessResponseDto> {
    return this.processService.handleProcess(body.processId);
  }

  @Get('persons/:id/loan-potential')
  @ApiOperation({
    summary: 'Get loan potential for a specific person',
    description:
      'Calculate the maximum amount a person can borrow from their friends',
  })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiOkResponse(LoanPotentialDto, 'Loan potential calculated successfully')
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid UUID format')
  async getLoanPotential(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<LoanPotentialDto> {
    return this.processService.getLoanPotentialForPerson(id);
  }
}