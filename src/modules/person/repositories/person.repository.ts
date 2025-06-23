import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdatePersonDto } from '../dto/update-person.dto';

@Injectable()
export class PersonRepository {
    private readonly logger = new Logger(PersonRepository.name);

    constructor(
        @InjectRepository(Person)
        private readonly personRepo: Repository<Person>,
    ) {}

    async create(createPersonDto: CreatePersonDto): Promise<Person> {
        const person = this.personRepo.create({
            id: uuidv4(),
            ...createPersonDto,
        });
        return this.personRepo.save(person);
    }

    async findAll(): Promise<Person[]> {
        return this.personRepo.find();
    }

    async findById(id: string, relations: string[] = []): Promise<Person> {
        const person = await this.personRepo.findOne({ where: { id }, relations });
        if (!person) {
            this.logger.warn(`Person with ID ${id} not found`);
            throw new NotFoundException(`Person with ID ${id} not found`);
        }
        return person;
    }

    async findByIds(ids: string[]): Promise<Person[]> {
        if (!ids || ids.length === 0) {
            return [];
        }
        return this.personRepo.findBy({ id: In(ids) });
    }

    async findByEmail(email: string): Promise<Person | null> {
        return this.personRepo.findOne({ where: { email } });
    }

    async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
        await this.personRepo.update(id, updatePersonDto);
        return this.findById(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.personRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Person with ID ${id} not found`);
        }
    }
}
