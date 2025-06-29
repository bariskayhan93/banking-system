import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Person } from '../person/entities/person.entity';
import { PersonService } from '../person/person.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { BankTransactionService } from '../bank-transaction/bank-transaction.service';
import { GremlinService } from '../gremlin/services/gremlin.service';

describe('SeedService', () => {
  let service: SeedService;
  let personRepository: jest.Mocked<Repository<Person>>;
  let entityManager: jest.Mocked<EntityManager>;
  let personService: jest.Mocked<PersonService>;
  let gremlinService: jest.Mocked<GremlinService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: EntityManager,
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Person),
          useValue: {
            count: jest.fn(),
          },
        },
        {
          provide: PersonService,
          useValue: {
            create: jest.fn(),
            addFriend: jest.fn(),
          },
        },
        {
          provide: BankAccountService,
          useValue: {
            create: jest.fn().mockResolvedValue({ iban: 'DE123', id: 'account-1' }),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: BankTransactionService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: GremlinService,
          useValue: {
            clearGraph: jest.fn(),
            friendshipExists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    personRepository = module.get(getRepositoryToken(Person));
    entityManager = module.get(EntityManager);
    personService = module.get(PersonService);
    gremlinService = module.get(GremlinService);
  });

  describe('checkIfSeeded', () => {
    it('should return true when database has data', async () => {
      personRepository.count.mockResolvedValue(5);
      const result = await service.checkIfSeeded();
      expect(result).toBe(true);
    });

    it('should return false when database is empty', async () => {
      personRepository.count.mockResolvedValue(0);
      const result = await service.checkIfSeeded();
      expect(result).toBe(false);
    });
  });

  describe('resetAndReseed', () => {
    it('should clear graph and truncate tables', async () => {
      personRepository.count.mockResolvedValue(0);

      // Mock the call to prevent full seeding in test
      jest.spyOn(service, 'seed' as any).mockResolvedValue(undefined);

      await service.resetAndReseed();

      expect(gremlinService.clearGraph).toHaveBeenCalled();
      expect(entityManager.query).toHaveBeenCalledWith(expect.stringContaining('TRUNCATE TABLE'));
    });
  });

  describe('seed', () => {
    it('should skip seeding if already seeded', async () => {
      personRepository.count.mockResolvedValue(5);

      await service.seed();

      expect(personService.create).not.toHaveBeenCalled();
    });

    it('should start seeding when database is empty', async () => {
      personRepository.count.mockResolvedValue(0);
      personService.create.mockResolvedValue({
        id: '1',
        name: 'John Doe',
        email: 'john@test.com',
        auth0UserId: 'auth0|123456789',
        netWorth: 0,
        bankAccounts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Person);

      await service.seed();

      expect(personService.create).toHaveBeenCalled();
    });
  });
});
