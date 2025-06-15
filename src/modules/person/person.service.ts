import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Person} from './entities/person.entity';
import {CreatePersonDto} from './dto/create-person.dto';
import {UpdatePersonDto} from './dto/update-person.dto';

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private readonly personRepository: Repository<Person>,
    ) {}

    findAll() {
        return this.personRepository.find();
    }

    async findOne(id: number) {
        const person = await this.personRepository.findOneBy({id});
        if (!person) throw new NotFoundException('Person not found');
        return person;
    }

    createTest(): Promise<Person> {
        const person = this.personRepository.create({
            firstName: "Test",
            lastName: "Test",
            email: "",
            isActive: true,
        });

        return this.personRepository.save(person);
    }

    create(data: CreatePersonDto) {
        const person = this.personRepository.create(data);
        return this.personRepository.save(person);
    }

    async update(id: number, data: UpdatePersonDto) {
        await this.findOne(id);
        await this.personRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number) {
        const person = await this.findOne(id);
        return this.personRepository.remove(person);
    }
}
