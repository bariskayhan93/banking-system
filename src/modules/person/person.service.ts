import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { PersonRepository } from './repositories/person.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { FRIENDSHIP_CONFIG } from '../../common/config/friendship.config';

@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name);

  constructor(
    private readonly repository: PersonRepository,
    private readonly gremlinService: GremlinService,
  ) {}

  async create(dto: CreatePersonDto): Promise<Person> {
    this.logger.log(`Creating person with email: ${dto.email}`);

    const emailExists = await this.repository.findByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException(`Email ${dto.email} is already in use.`);
    }

    const person = await this.repository.create(dto);
    await this.gremlinService.addPersonVertex(person.id, person.name, person.email);

    return person;
  }

  async findAll(): Promise<Person[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<Person> {
    return this.repository.findById(id);
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    await this.repository.findById(id);

    if (dto.email) {
      const personByEmail = await this.repository.findByEmail(dto.email);
      if (personByEmail && personByEmail.id !== id) {
        throw new ConflictException(`Email ${dto.email} is already in use.`);
      }
    }

    const updatedPerson = await this.repository.update(id, dto);
    await this.gremlinService.updatePersonVertex(id, dto);

    return updatedPerson;
  }

  async remove(id: string): Promise<void> {
    await this.repository.findById(id);
    await this.repository.remove(id);
    await this.gremlinService.removePersonVertex(id);
  }

  async addFriend(personId: string, friendId: string): Promise<void> {
    if (personId === friendId) {
      throw new BadRequestException('A person cannot be friends with themselves.');
    }

    await this.repository.findById(personId);
    await this.repository.findById(friendId);

    const friendshipExists = await this.gremlinService.friendshipExists(personId, friendId);
    if (friendshipExists) {
      throw new ConflictException('Friendship already exists.');
    }

    // Check for potential cycles in the friendship network
    const wouldCreateCycle = await this.gremlinService.detectFriendshipCycle(personId, friendId);
    if (wouldCreateCycle) {
      this.logger.warn(`Friendship cycle detected between ${personId} and ${friendId}`);
      throw new BadRequestException(
        'Adding this friendship would create a cycle in the network. ' +
          'This person is already reachable through mutual friends.',
      );
    }

    // Check network size limits to prevent overly large networks
    const stats = await this.gremlinService.getFriendshipNetworkStats(personId);

    if (stats.directFriends >= FRIENDSHIP_CONFIG.MAX_DIRECT_FRIENDS) {
      throw new BadRequestException(
        `Maximum number of direct friends (${FRIENDSHIP_CONFIG.MAX_DIRECT_FRIENDS}) reached.`,
      );
    }

    await this.gremlinService.addFriendshipEdge(personId, friendId);
    this.logger.log(`Friendship created between ${personId} and ${friendId}`);
  }

  async getFriends(personId: string): Promise<Person[]> {
    await this.repository.findById(personId);
    const friendIds = await this.gremlinService.findFriendIds(personId);
    if (friendIds.length === 0) {
      return [];
    }
    return this.repository.findByIds(friendIds);
  }
}
