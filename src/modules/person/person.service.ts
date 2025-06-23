import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PersonRepository } from './repositories/person.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { GremlinService } from '../gremlin/services/gremlin.service';

@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name);

  constructor(
      private readonly personRepository: PersonRepository,
      private readonly gremlinService: GremlinService,
  ) {}

  /**
   * Create a new person
   */
  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const emailExists = await this.personRepository.findByEmail(createPersonDto.email);
    if (emailExists) {
        throw new ConflictException(`Email ${createPersonDto.email} is already in use.`);
    }

    const person = await this.personRepository.create(createPersonDto);

    await this.gremlinService.addPersonVertex(person.id, person.name, person.email);

    return person;
  }

  /**
   * Find all persons
   */
  async findAll(): Promise<Person[]> {
    return this.personRepository.findAll();
  }

  /**
   * Find person by ID
   */
  async findOne(id: string): Promise<Person> {
    return this.personRepository.findById(id);
  }

  /**
   * Update person data
   */
  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    await this.personRepository.findById(id);

    if (updatePersonDto.email) {
        const personByEmail = await this.personRepository.findByEmail(updatePersonDto.email);
        if (personByEmail && personByEmail.id !== id) {
            throw new ConflictException(`Email ${updatePersonDto.email} is already in use.`);
        }
    }

    const updatedPerson = await this.personRepository.update(id, updatePersonDto);

    await this.gremlinService.updatePersonVertex(id, updatePersonDto);

    return updatedPerson;
  }

  /**
   * Delete a person
   */
  async remove(id: string): Promise<void> {
    await this.personRepository.findById(id);
    
    await this.personRepository.remove(id);

    await this.gremlinService.removePersonVertex(id);
  }

  /**
   * Create friendship between two persons
   */
  async addFriend(personId: string, friendId: string): Promise<void> {
    if (personId === friendId) {
        throw new BadRequestException('A person cannot be friends with themselves.');
    }

    await this.personRepository.findById(personId);
    await this.personRepository.findById(friendId);

    const friendshipExists = await this.gremlinService.friendshipExists(personId, friendId);
    if (friendshipExists) {
        throw new ConflictException('Friendship already exists.');
    }

    await this.gremlinService.addFriendshipEdge(personId, friendId);
  }

  /**
   * Get all friends of a person
   */
  async getFriends(personId: string): Promise<Person[]> {
    await this.personRepository.findById(personId);
    const friendIds = await this.gremlinService.findFriendIds(personId);
    if (friendIds.length === 0) {
        return [];
    }
    return this.personRepository.findByIds(friendIds);
  }
}