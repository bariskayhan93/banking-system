import { Test, TestingModule } from '@nestjs/testing';
import { BankProcessController } from './bank-process.controller';

describe('BankProcessController', () => {
  let controller: BankProcessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankProcessController],
    }).compile();

    controller = module.get<BankProcessController>(BankProcessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
