import {Test, TestingModule} from '@nestjs/testing';
import {BankTransactionController} from './bank-transaction.controller';
import {BankTransactionService} from './bank-transaction.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {BankTransaction} from './entities/bank-transaction.entity';
import {BankAccount} from '../bank-account/bank-account.entity'; 

describe('BankTransactionController', () => {
    let controller: BankTransactionController;

    const mockBankTransactionRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOneBy: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
    };

    const mockBankAccountRepository = {
        findOneBy: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BankTransactionController],
            providers: [
                BankTransactionService,
                {
                    provide: getRepositoryToken(BankTransaction),
                    useValue: mockBankTransactionRepository,
                },
                {
                    provide: getRepositoryToken(BankAccount),
                    useValue: mockBankAccountRepository,
                },
            ],
        }).compile();

        controller = module.get<BankTransactionController>(BankTransactionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
