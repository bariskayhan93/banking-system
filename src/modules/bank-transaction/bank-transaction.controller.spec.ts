import {Test, TestingModule} from '@nestjs/testing';
import {BankTransactionController} from './bank-transaction.controller';
import {BankTransactionService} from './bank-transaction.service';
import {NotFoundException} from '@nestjs/common';

describe('BankTransactionController', () => {
  let controller: BankTransactionController;
  let service: Partial<BankTransactionService>;

  const mockTransaction = {
    id: 'tx-id', amount: 100, description: 'desc', otherIban: 'other-iban',
    createdAt: new Date(), updatedAt: new Date(), bankAccount: { iban: 'iban' }
  } as any;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByIban: jest.fn(),
  };

  beforeEach(async () => {
    service = mockService;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankTransactionController],
      providers: [{ provide: BankTransactionService, useValue: service }],
    }).compile();

    controller = module.get<BankTransactionController>(BankTransactionController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('creates and returns a transaction', async () => {
      mockService.create!.mockResolvedValue(mockTransaction);
      const result = await controller.create({} as any);
      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: mockTransaction.id }));
    });

    it('propagates NotFoundException', async () => {
      mockService.create!.mockRejectedValue(new NotFoundException());
      await expect(controller.create({} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all transactions', async () => {
      mockService.findAll!.mockResolvedValue([mockTransaction]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('filters by IBAN', async () => {
      mockService.findByIban!.mockResolvedValue([mockTransaction]);
      const result = await controller.findAll('iban');
      expect(service.findByIban).toHaveBeenCalledWith('iban');
      expect(result).toHaveLength(1);
    });

    it('propagates NotFoundException', async () => {
      mockService.findByIban!.mockRejectedValue(new NotFoundException());
      await expect(controller.findAll('iban')).rejects.toThrow(NotFoundException);
    });
  });
});
