import {Body, Controller, Post} from '@nestjs/common';
import {BankProcessService} from "./bank-process.service";
import {LoanPotential} from "./dto/loan-potential.dto";
import {ApiBody, ApiResponse} from "@nestjs/swagger";
import {ProcessDto} from "./dto/process.dto";

@Controller('processes')
export class BankProcessController {
    constructor(private readonly processingService: BankProcessService) {}

  @Post()
  @ApiBody({ type: ProcessDto })
  @ApiResponse({ status: 200, description: 'Success' })
  async process(@Body() body: ProcessDto): Promise<void | LoanPotential[]> {
    return this.processingService.handleProcess(body.processId);
  }
}