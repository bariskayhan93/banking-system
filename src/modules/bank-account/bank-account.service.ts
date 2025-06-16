import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Person} from '../person/entities/person.entity';
import {CreateBankAccountDto} from "./dto/create-bank-account.dto";
import {UpdateBankAccountDto} from "./dto/update-bank-account.dto";
import {BankAccount} from "./entities/bank-account.entity";

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

    async findOne(iban: string) {
        const account = await this.bankRepo.findOne({
            where: {iban},
            relations: ['person'],
        });
        if (!account) throw new NotFoundException('BankAccount not found');
        return account;
    }

    async update(iban: string, dto: UpdateBankAccountDto) {
        const existing = await this.findOne(iban);

        if (dto.personId) {
            const person = await this.personRepo.findOneBy({id: dto.personId});
            if (!person) throw new NotFoundException('Person not found');
            existing.person = person;
        }

        const { personId, ...updateData } = dto;
        Object.assign(existing, updateData);
        
        return this.bankRepo.save(existing);
    }

    async remove(iban: string) {
        const existing = await this.findOne(iban);
        return this.bankRepo.remove(existing);
    }
}
