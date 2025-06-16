import {Test, TestingModule} from '@nestjs/testing';
import {BankTransactionService} from './bank-transaction.service';
import {getRepositoryToken} from '@nestjs/typeorm';
import {BankTransaction} from './entities/bank-transaction.entity';
import {BankAccount} from '../bank-account/bank-account.entity';

describe('BankTransactionService', () => {
    let service: BankTransactionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BankTransactionService,
                {
                    provide: getRepositoryToken(BankTransaction),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(BankAccount),
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<BankTransactionService>(BankTransactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
