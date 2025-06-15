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

    async create(createPersonDto:CreatePersonDto) {
        const person: Person = this.personRepository.create(createPersonDto);
        const savedPerson = await this.personRepository.save(person);
        
        await this.gremlinService.savePerson(savedPerson.id, {
            name: savedPerson.name,
            email: savedPerson.email!
        });
        
        return savedPerson;
    }

    async update(id: string, data: UpdatePersonDto) {
        const person = await this.findOne(id);
        const updatedPerson = Object.assign(person, data);
        await this.personRepository.update(person.id, updatedPerson);
        
        await this.gremlinService.savePerson(updatedPerson.id, {
            name: updatedPerson.name,
            email: updatedPerson.email!
        });
        
        return updatedPerson;
    }

    async remove(id: string) {
        const person = await this.findOne(id);
        await this.gremlinService.deletePerson(person.id);
        return this.personRepository.remove(person);
    }

    async makeFriends(person1Id: string, person2Id: string) {
        await this.gremlinService.getPerson(person1Id);
        await this.gremlinService.getPerson(person2Id);

        await this.gremlinService.addFriend(person1Id, person2Id);
        return { message: `Friendship created between ${person1Id} and ${person2Id}` };
    }
    
    async getFriends(personId: string) {
        return this.gremlinService.getFriends(personId);
    }
    
    findAll() {
        return this.personRepository.find();
    }

    async findOne(id: string) {
        const person = await this.personRepository.findOneBy({id});
        if (!person) throw new NotFoundException('Person not found');
        return person;
    }
}
