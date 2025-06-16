import { Test, TestingModule } from '@nestjs/testing';
import { BankProcessController } from './bank-process.controller';
import { BankProcessService } from './bank-process.service';

describe('ProcessController', () => {
  let controller: BankProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankProcessController],
      providers: [
        {
          provide: BankProcessService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BankProcessController>(BankProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
