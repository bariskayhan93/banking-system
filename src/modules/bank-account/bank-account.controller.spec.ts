import {Test, TestingModule} from '@nestjs/testing';
import {BankAccountController} from './bank-account.controller';
import {BankAccountService} from './bank-account.service';

describe('BankAccountController', () => {
    let controller: BankAccountController;

    const mockBankAccountService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BankAccountController],
            providers: [
                {
                    provide: BankAccountService,
                    useValue: mockBankAccountService,
                },
            ],
        }).compile();

        controller = module.get<BankAccountController>(BankAccountController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
