import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BankAccount} from './bank-account.entity';
import {Person} from '../person/entities/person.entity';
import {CreateBankAccountDto} from "./dto/create-bank-account.dto";
import {UpdateBankAccountDto} from "./dto/update-bank-account.dto";

@Injectable()
export class BankAccountService {
    constructor(
        @InjectRepository(BankAccount)
        private readonly bankRepo: Repository<BankAccount>,
        @InjectRepository(Person)
        private readonly personRepo: Repository<Person>,
    ) {}

    async create(dto: CreateBankAccountDto) {
        const person = await this.personRepo.findOneBy({id: dto.personId});
        if (!person) throw new NotFoundException('Person not found');

        const bankAccount = this.bankRepo.create({
            iban: dto.iban,
            bankName: dto.bankName,
            person,
        });

        return this.bankRepo.save(bankAccount);
    }

    findAll() {
        return this.bankRepo.find({relations: ['person']});
    }

    async findOne(id: number) {
        const account = await this.bankRepo.findOne({
            where: {id},
            relations: ['person'],
        });
        if (!account) throw new NotFoundException('BankAccount not found');
        return account;
    }

    async update(id: number, dto: UpdateBankAccountDto) {
        const existing = await this.findOne(id);

        if (dto.personId) {
            const person = await this.personRepo.findOneBy({id: dto.personId});
            if (!person) throw new NotFoundException('Person not found');
            existing.person = person;
        }

        Object.assign(existing, dto);
        return this.bankRepo.save(existing);
    }

    async remove(id: number) {
        const existing = await this.findOne(id);
        return this.bankRepo.remove(existing);
    }
}
