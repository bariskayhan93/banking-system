import { Test, TestingModule } from '@nestjs/testing';
import { LoanCalculatorService } from './loan-calculator.service';
import { Person } from '../../person/entities/person.entity';

describe('LoanCalculatorService', () => {
  let service: LoanCalculatorService;

  const createPerson = (id: string, name: string, netWorth: number): Person => ({
    id,
    name,
    netWorth,
    email: `${name.toLowerCase()}@test.com`,
    bankAccounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoanCalculatorService],
    }).compile();

    service = module.get<LoanCalculatorService>(LoanCalculatorService);
  });

  describe('calculateLoanPotential', () => {
    it('should return empty result when person has no friends', () => {
      const person = createPerson('1', 'John', 10000);
      const result = service.calculateLoanPotential(person, []);

      expect(result.totalAmount).toBe(0);
      expect(result.contributions).toEqual([]);
      expect(result.method).toBe('DIFFERENCE_BASED');
    });

    it('should return empty result when friends are poorer', () => {
      const person = createPerson('1', 'John', 20000);
      const friends = [createPerson('2', 'Alice', 15000)];
      const result = service.calculateLoanPotential(person, friends);

      expect(result.totalAmount).toBe(0);
      expect(result.contributions).toEqual([]);
    });

    it('should calculate loan from richer friend', () => {
      const person = createPerson('1', 'John', 10000);
      const friends = [createPerson('2', 'Alice', 20000)];
      const result = service.calculateLoanPotential(person, friends);

      expect(result.totalAmount).toBe(10000); // 20000 - 10000
      expect(result.contributions).toHaveLength(1);
      expect(result.contributions[0].maxLoanFromFriend).toBe(10000);
      expect(result.contributions[0].lendingPercentage).toBe(50); // (10000 / 20000) * 100
    });

    it('should cap loan at max per friend limit', () => {
      const person = createPerson('1', 'John', 10000);
      const friends = [createPerson('2', 'Alice', 100000)]; // 100000 - 10000 = 90000, but capped at 10000
      const result = service.calculateLoanPotential(person, friends);

      expect(result.totalAmount).toBe(10000);
      expect(result.contributions[0].maxLoanFromFriend).toBe(10000);
    });

    it('should sum loans from multiple rich friends', () => {
      const person = createPerson('1', 'John', 10000);
      const friends = [
        createPerson('2', 'Alice', 20000), // 20000 - 10000 = 10000 loan
        createPerson('3', 'Bob', 16000), // 16000 - 10000 = 6000 loan
      ];
      const result = service.calculateLoanPotential(person, friends);

      expect(result.totalAmount).toBe(16000);
      expect(result.contributions).toHaveLength(2);
    });

    it('should sort contributions by amount descending', () => {
      const person = createPerson('1', 'John', 10000);
      const friends = [
        createPerson('2', 'Alice', 16000), // 16000 - 10000 = 6000 loan
        createPerson('3', 'Bob', 20000), // 20000 - 10000 = 10000 loan
      ];
      const result = service.calculateLoanPotential(person, friends);

      expect(result.contributions[0].maxLoanFromFriend).toBe(10000);
      expect(result.contributions[1].maxLoanFromFriend).toBe(6000);
    });
  });
});
