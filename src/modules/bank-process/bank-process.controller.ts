import {Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import { BankProcessService } from './bank-process.service';
import { LoanPotentialDto } from './dto/loan-potential.dto';
import { ProcessDto } from './dto/process.dto';
import { ProcessResponseDto } from './dto/process-response.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '../../common/decorators/api-response.decorator';
import {JwtAuthGuard} from "../../common/auth/jwt-auth.guard";

@ApiTags('processes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('processes')
export class BankProcessController {
  constructor(private readonly service: BankProcessService) {}

  @Post()
  @ApiOperation({
    summary: 'Trigger banking processes',
    description:
      'Executes processes based on ID. Higher IDs include lower ones: 1-Update balances, 2-Calculate net worths, 3-Calculate loan potentials.',
  })
  @ApiOkResponse(ProcessResponseDto, 'Processing succeeded')
  @ApiBadRequestResponse('Invalid request data')
  async process(@Body() dto: ProcessDto): Promise<ProcessResponseDto> {
    return this.service.handleProcess(dto.processId);
  }

  @Get('persons/:id/loan-potential')
  @ApiOperation({
    summary: 'Get loan potential for a person',
    description: 'Calculate maximum borrowing amount from friends',
  })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiOkResponse(LoanPotentialDto, 'Loan potential calculated successfully')
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid UUID format')
  async getLoanPotential(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<LoanPotentialDto> {
    return this.service.getLoanPotentialForPerson(id);
  }
}
