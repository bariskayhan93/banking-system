import { Test, TestingModule } from '@nestjs/testing';
import { BankProcessService } from './bank-process.service';

describe('ProcessService', () => {
  let service: BankProcessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankProcessService],
    }).compile();

    service = module.get<BankProcessService>(BankProcessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
