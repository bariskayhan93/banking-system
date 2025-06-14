import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
    ){}
    
    createTest(): Promise<Person> {
        const person = this.personRepository.create({
            firstName: "Test",
            lastName: "Test",
            email: "",
            isActive: true,
        });
        
        return this.personRepository.save(person);
    }
    
    findAll(): Promise<Person[]> {
        return this.personRepository.find();
    }
}
