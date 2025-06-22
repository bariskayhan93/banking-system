import { Body, Controller, Get, HttpStatus, Logger, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiParam,
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from "@nestjs/swagger";
import { BankProcessService } from "./bank-process.service";
import { LoanPotentialDto } from "./dto/loan-potential.dto";
import { ProcessDto } from "./dto/process.dto";

@ApiTags('processes')
@Controller('processes')
export class BankProcessController {
    private readonly logger = new Logger(BankProcessController.name);
    
    constructor(private readonly processService: BankProcessService) {}

    @Post()
    @ApiOperation({ 
      summary: 'Webhook endpoint for nightly processing', 
      description: 'Triggers banking processes based on the provided process ID. Higher process IDs automatically execute lower ones. Process 1: Update account balances. Process 2: Calculate net worths. Process 3: Calculate loan potentials.'
    })
    @ApiBody({ type: ProcessDto })
    @ApiResponse({ 
      status: HttpStatus.OK, 
      description: 'Processing succeeded'
    })
    @ApiBadRequestResponse({ description: 'Invalid request data' })
    async process(@Body() body: ProcessDto): Promise<any> {
      this.logger.log(`Processing webhook request with processId: ${body.processId}`);
      return this.processService.handleProcess(body.processId);
    }
    
    @Get('persons/:id/loan-potential')
    @ApiOperation({ 
      summary: 'Get loan potential for a specific person', 
      description: 'Calculate the maximum amount a person can borrow from their friends'
    })
    @ApiParam({ name: 'id', description: 'Person ID', type: String })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Loan potential calculated successfully',
      type: LoanPotentialDto
    })
    @ApiNotFoundResponse({ description: 'Person not found' })
    @ApiBadRequestResponse({ description: 'Invalid UUID format' })
    async getLoanPotential(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string
    ): Promise<LoanPotentialDto> {
      this.logger.log(`Endpoint called: Get loan potential for person ${id}`);
      return this.processService.getLoanPotentialForPerson(id);
    }
}