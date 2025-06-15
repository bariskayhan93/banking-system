import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Person} from './entities/person.entity';
import {CreatePersonDto} from './dto/create-person.dto';
import {UpdatePersonDto} from './dto/update-person.dto';
import {GremlinService} from "../gremlin/services/gremlin.service";

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private readonly personRepository: Repository<Person>,
        private readonly gremlinService: GremlinService,
    ) {}

    async makeFriends(person1Id: string, person2Id: string) {
        await this.gremlinService.addFriendship(person1Id, person2Id);
    }

    async listFriends(personId: string): Promise<string[]> {
        return this.gremlinService.getFriendIds(personId);
    }

    findAll() {
        return this.personRepository.find();
    }

    async findOne(id: string) {
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

    async update(id: string, data: UpdatePersonDto) {
        await this.findOne(id);
        await this.personRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string) {
        const person = await this.findOne(id);
        return this.personRepository.remove(person);
    }
}
