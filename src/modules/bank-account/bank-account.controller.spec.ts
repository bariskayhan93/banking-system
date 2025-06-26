import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BankAccountController } from './bank-account.controller';
import { BankAccountService } from './bank-account.service';

describe('BankAccountController', () => {
  let controller: BankAccountController;
  let service: Partial<BankAccountService>;

  const mockAccount = {
    iban: 'iban',
    bankName: 'Test',
    balance: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    person: { id: 'pid' },
  } as any;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPersonId: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    service = mockService;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankAccountController],
      providers: [{ provide: BankAccountService, useValue: service }],
    }).compile();

    controller = module.get<BankAccountController>(BankAccountController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('creates an account', async () => {
      (service.create as jest.Mock).mockResolvedValue(mockAccount);
      const result = await controller.create({} as any);
      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ iban: mockAccount.iban }));
    });

    it('throws ConflictException', async () => {
      (service.create as jest.Mock).mockRejectedValue(new ConflictException());
      await expect(controller.create({} as any)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException', async () => {
      (service.create as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.create({} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all accounts', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([mockAccount]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('filters by personId', async () => {
      (service.findByPersonId as jest.Mock).mockResolvedValue([mockAccount]);
      const result = await controller.findAll('pid');
      expect(service.findByPersonId).toHaveBeenCalledWith('pid');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns an account', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockAccount);
      const result = await controller.findOne('iban');
      expect(service.findOne).toHaveBeenCalledWith('iban');
      expect(result).toEqual(expect.objectContaining({ iban: mockAccount.iban }));
    });

    it('throws NotFoundException', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('iban')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('calls remove', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);
      await controller.remove('iban');
      expect(service.remove).toHaveBeenCalledWith('iban');
    });

    it('throws NotFoundException', async () => {
      (service.remove as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.remove('iban')).rejects.toThrow(NotFoundException);
    });
  });
});
