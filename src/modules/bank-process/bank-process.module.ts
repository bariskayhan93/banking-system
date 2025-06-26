import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankProcessController } from './bank-process.controller';
import { BankProcessService } from './bank-process.service';
import { BankProcessRepository } from './repositories/bank-process.repository';
import { LoanCalculatorService } from './services/loan-calculator.service';
import { Person } from '../person/entities/person.entity';
import { GremlinModule } from '../gremlin/gremlin.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), GremlinModule, PersonModule],
  controllers: [BankProcessController],
  providers: [BankProcessService, BankProcessRepository, LoanCalculatorService],
  exports: [BankProcessService, BankProcessRepository, LoanCalculatorService],
})
export class BankProcessModule {}
