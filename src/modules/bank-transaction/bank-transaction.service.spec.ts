import { Test, TestingModule } from '@nestjs/testing';
import { BankTransactionService } from './bank-transaction.service';
import { BankTransactionRepository } from './repositories/bank-transaction.repository';
import { BankAccountRepository } from '../bank-account/repositories/bank-account.repository';
import { NotFoundException } from '@nestjs/common';
import { BankAccount } from '../bank-account/entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';

describe('BankTransactionService', () => {
  let service: BankTransactionService;
  let transactionRepository: Partial<BankTransactionRepository>;
  let accountRepository: Partial<BankAccountRepository>;

  const mockAccount = { iban: 'iban-1' } as BankAccount;
  const mockTransaction = { id: 'tx-1' } as BankTransaction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankTransactionService,
        {
          provide: BankTransactionRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockTransaction),
            findAll: jest.fn().mockResolvedValue([mockTransaction]),
            findByIban: jest.fn().mockResolvedValue([mockTransaction]),
          },
        },
        {
          provide: BankAccountRepository,
          useValue: {
            findByIban: jest.fn().mockResolvedValue(mockAccount),
          },
        },
      ],
    }).compile();

    service = module.get<BankTransactionService>(BankTransactionService);
    transactionRepository = module.get<BankTransactionRepository>(BankTransactionRepository);
    accountRepository = module.get<BankAccountRepository>(BankAccountRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const dto = { iban: 'iban-1' } as any;
      const result = await service.create(dto);
      expect(accountRepository.findByIban).toHaveBeenCalledWith(dto.iban);
      expect(transactionRepository.create).toHaveBeenCalledWith(dto, mockAccount);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      (accountRepository.findByIban as jest.Mock).mockResolvedValue(null);
      const dto = { iban: 'non-existent-iban' } as any;
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const result = await service.findAll();
      expect(transactionRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('findByIban', () => {
    it('should return transactions for a given iban', async () => {
      const result = await service.findByIban('iban-1');
      expect(accountRepository.findByIban).toHaveBeenCalledWith('iban-1');
      expect(transactionRepository.findByIban).toHaveBeenCalledWith('iban-1');
      expect(result).toEqual([mockTransaction]);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      (accountRepository.findByIban as jest.Mock).mockResolvedValue(null);
      await expect(service.findByIban('non-existent-iban')).rejects.toThrow(NotFoundException);
    });
  });
});
