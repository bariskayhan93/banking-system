import { Test, TestingModule } from '@nestjs/testing';
import { BankProcessService } from './bank-process.service';
import { BankProcessRepository } from './repositories/bank-process.repository';
import { PersonRepository } from '../person/repositories/person.repository';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { Person } from '../person/entities/person.entity';
import { LoanCalculatorService } from './services/loan-calculator.service';

describe('BankProcessService', () => {
  let service: BankProcessService;
  let bankProcessRepository: Partial<BankProcessRepository>;
  let personRepository: Partial<PersonRepository>;
  let gremlinService: Partial<GremlinService>;

  const mockPerson = { id: 'person-1', netWorth: 1000 } as Person;
  const mockFriend = { id: 'friend-1', netWorth: 2000 } as Person;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankProcessService,
        {
          provide: BankProcessRepository,
          useValue: {
            updateAccountBalances: jest.fn(),
            calculateNetWorths: jest.fn(),
          },
        },
        {
          provide: PersonRepository,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockPerson),
            findByIds: jest.fn().mockResolvedValue([mockFriend]),
            findAll: jest.fn().mockResolvedValue([mockPerson, mockFriend]),
          },
        },
        {
          provide: GremlinService,
          useValue: {
            findFriendIds: jest.fn().mockResolvedValue([mockFriend.id]),
            findMultipleFriendIds: jest
              .fn()
              .mockResolvedValue(new Map([['person-1', ['friend-1']]])),
          },
        },
        {
          provide: LoanCalculatorService,
          useValue: {
            calculateLoanPotential: jest.fn().mockImplementation((person, friends) => {
              const personNetWorth = Number(person.netWorth);
              const richFriends = friends.filter(f => Number(f.netWorth) > personNetWorth);

              if (richFriends.length === 0) {
                return {
                  totalAmount: 0,
                  contributions: [],
                  method: 'PERCENTAGE_BASED',
                };
              }

              return {
                totalAmount: 500,
                contributions: [
                  {
                    friendId: richFriends[0].id,
                    friendName: richFriends[0].name,
                    friendNetWorth: Number(richFriends[0].netWorth),
                    maxLoanFromFriend: 500,
                    lendingPercentage: 25,
                  },
                ],
                method: 'PERCENTAGE_BASED',
              };
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BankProcessService>(BankProcessService);
    bankProcessRepository = module.get<BankProcessRepository>(BankProcessRepository);
    personRepository = module.get<PersonRepository>(PersonRepository);
    gremlinService = module.get<GremlinService>(GremlinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleProcess', () => {
    it('should run processes up to the given id', async () => {
      const result = await service.handleProcess(3);
      expect(bankProcessRepository.updateAccountBalances).toHaveBeenCalled();
      expect(bankProcessRepository.calculateNetWorths).toHaveBeenCalled();
      expect(personRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Processes up to 3 completed successfully.' });
    });
  });

  describe('getLoanPotentialForPerson', () => {
    it('should calculate the loan potential for a person', async () => {
      const result = await service.getLoanPotentialForPerson(mockPerson.id);
      expect(personRepository.findById).toHaveBeenCalledWith(mockPerson.id);
      expect(gremlinService.findFriendIds).toHaveBeenCalledWith(mockPerson.id);
      expect(personRepository.findByIds).toHaveBeenCalledWith([mockFriend.id]);
      expect(result).toEqual({
        personId: mockPerson.id,
        personNetWorth: 1000,
        maxLoanAmount: 500,
        calculationMethod: 'PERCENTAGE_BASED',
        friendContributions: [
          {
            friendId: mockFriend.id,
            friendName: undefined,
            friendNetWorth: 2000,
            maxLoanFromFriend: 500,
            lendingPercentage: 25,
          },
        ],
      });
    });

    it('should return 0 if person has no friends richer than them', async () => {
      (gremlinService.findFriendIds as jest.Mock).mockResolvedValueOnce(['friend-2']);
      (personRepository.findByIds as jest.Mock).mockResolvedValueOnce([
        {
          id: 'friend-2',
          netWorth: 500,
        } as Person,
      ]);
      const result = await service.getLoanPotentialForPerson(mockPerson.id);
      expect(result).toEqual({
        personId: mockPerson.id,
        personNetWorth: 1000,
        maxLoanAmount: 0,
        calculationMethod: 'PERCENTAGE_BASED',
        friendContributions: [],
      });
    });
  });
});
