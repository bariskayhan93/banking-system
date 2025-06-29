import { Test, TestingModule } from '@nestjs/testing';
import { BankAccountService } from './bank-account.service';
import { BankAccountRepository } from './repositories/bank-account.repository';
import { PersonRepository } from '../person/repositories/person.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BankAccount } from './entities/bank-account.entity';
import { Person } from '../person/entities/person.entity';

describe('BankAccountService', () => {
  let service: BankAccountService;
  let repository: Partial<BankAccountRepository>;
  let personRepository: Partial<PersonRepository>;

  const mockPerson = { id: 'person-id' } as Person;
  const mockAccount = { iban: 'iban' } as BankAccount;
  const createDto = { iban: 'iban', personId: 'person-id', bankName: 'Test Bank' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankAccountService,
        {
          provide: BankAccountRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockAccount),
            findAll: jest.fn().mockResolvedValue([mockAccount]),
            findByIban: jest.fn(),
            findByPersonId: jest.fn().mockResolvedValue([mockAccount]),
            remove: jest.fn(),
          },
        },
        {
          provide: PersonRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockPerson),
          },
        },
      ],
    }).compile();

    service = module.get<BankAccountService>(BankAccountService);
    repository = module.get<BankAccountRepository>(BankAccountRepository);
    personRepository = module.get<PersonRepository>(PersonRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a bank account', async () => {
      (repository.findByIban as jest.Mock).mockResolvedValue(null);
      const result = await service.create(createDto);
      expect(personRepository.findById).toHaveBeenCalledWith(createDto.personId);
      expect(repository.findByIban).toHaveBeenCalledWith(createDto.iban);
      expect(repository.create).toHaveBeenCalledWith(mockPerson, createDto);
      expect(result).toEqual(mockAccount);
    });

    it('should throw ConflictException if account already exists', async () => {
      (repository.findByIban as jest.Mock).mockResolvedValue(mockAccount);
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if person not found', async () => {
      (personRepository.findById as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all bank accounts', async () => {
      const result = await service.findAll();
      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockAccount]);
    });
  });

  describe('findOne', () => {
    it('should return a bank account', async () => {
      (repository.findByIban as jest.Mock).mockResolvedValue(mockAccount);
      const result = await service.findOne('iban');
      expect(repository.findByIban).toHaveBeenCalledWith('iban');
      expect(result).toEqual(mockAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      (repository.findByIban as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('iban')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPersonId', () => {
    it('should return accounts for a person', async () => {
      const result = await service.findByPersonId('person-id');
      expect(personRepository.findById).toHaveBeenCalledWith('person-id');
      expect(repository.findByPersonId).toHaveBeenCalledWith('person-id');
      expect(result).toEqual([mockAccount]);
    });

    it('should throw NotFoundException if person not found', async () => {
      (personRepository.findById as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(service.findByPersonId('person-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a bank account', async () => {
      await service.remove('iban');
      expect(repository.remove).toHaveBeenCalledWith('iban');
    });

    it('should throw NotFoundException if account to remove is not found', async () => {
      (repository.remove as jest.Mock).mockRejectedValue(
        new NotFoundException('Account iban not found'),
      );
      await expect(service.remove('iban')).rejects.toThrow(NotFoundException);
    });
  });
});
