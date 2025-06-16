import {Test, TestingModule} from '@nestjs/testing';
import {BankAccountService} from './bank-account.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {BankAccount} from './bank-account.entity';
import {Person} from '../person/entities/person.entity';
import {Repository} from 'typeorm';
import {NotFoundException} from '@nestjs/common';

const mockBankRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
});

const mockPersonRepo = () => ({
    findOneBy: jest.fn(),
});

describe('BankAccountService', () => {
    let service: BankAccountService;
    let bankRepo: jest.Mocked<Repository<BankAccount>>;
    let personRepo: jest.Mocked<Repository<Person>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BankAccountService,
                {provide: getRepositoryToken(BankAccount), useFactory: mockBankRepo},
                {provide: getRepositoryToken(Person), useFactory: mockPersonRepo},
            ],
        }).compile();

        service = module.get<BankAccountService>(BankAccountService);
        bankRepo = module.get(getRepositoryToken(BankAccount));
        personRepo = module.get(getRepositoryToken(Person));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a bank account', async () => {
            const dto = {iban: 'DE123', bankName: 'TestBank', personId: 'rerere_43434_55555'};
            const person = {id: 'rerere_43434_55555'} as Person;
            const bankAccount = {iban: dto.iban, bankName: dto.bankName, person};

            personRepo.findOneBy.mockResolvedValue(person);
            bankRepo.create.mockReturnValue(bankAccount as BankAccount);
            bankRepo.save.mockResolvedValue(bankAccount as BankAccount);

            const result = await service.create(dto);
            expect(result).toEqual(bankAccount);
        });

        it('should throw if person not found', async () => {
            personRepo.findOneBy.mockResolvedValue(null);
            await expect(service.create({iban: 'DE123', bankName: 'TestBank', personId: 'rerere_43434_55555'}))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all bank accounts', async () => {
            const accounts = [{iban: 'DE1'}, {iban: 'DE2'}] as BankAccount[];
            bankRepo.find.mockResolvedValue(accounts);
            expect(await service.findAll()).toEqual(accounts);
        });
    });

    describe('findOne', () => {
        it('should return a bank account', async () => {
            const account = {iban: 'DE123'} as BankAccount;
            bankRepo.findOne.mockResolvedValue(account);
            expect(await service.findOne('DE123')).toEqual(account);
        });

        it('should throw if account not found', async () => {
            bankRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('INVALID')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update and return the bank account', async () => {
            const existing = {iban: 'DE123', bankName: 'Old', person: {}} as BankAccount;
            const updated = {...existing, bankName: 'New'};
            bankRepo.findOne.mockResolvedValue(existing);
            bankRepo.save.mockResolvedValue(updated);

            const result = await service.update('DE123', {bankName: 'New'});
            expect(result).toEqual(updated);
        });

        it('should throw if account not found', async () => {
            bankRepo.findOne.mockResolvedValue(null);
            await expect(service.update('INVALID', {bankName: 'Test'}))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove and return the bank account', async () => {
            const account = {iban: 'DE123'} as BankAccount;
            bankRepo.findOne.mockResolvedValue(account);
            bankRepo.remove.mockResolvedValue(account);
            expect(await service.remove('DE123')).toEqual(account);
        });

        it('should throw if account not found', async () => {
            bankRepo.findOne.mockResolvedValue(null);
            await expect(service.remove('INVALID')).rejects.toThrow(NotFoundException);
        });
    });
});
