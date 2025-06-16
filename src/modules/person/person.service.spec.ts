import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { Repository } from 'typeorm';

describe('PersonService', () => {
  let service: PersonService;
  let personRepository: Repository<Person>;
  let gremlinService: GremlinService;

  const mockPersonRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockGremlinService = {
    savePerson: jest.fn(),
    deletePerson: jest.fn(),
    getPerson: jest.fn(),
    addFriend: jest.fn(),
    getFriends: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: mockPersonRepository,
        },
        {
          provide: GremlinService,
          useValue: mockGremlinService,
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    personRepository = module.get<Repository<Person>>(getRepositoryToken(Person));
    gremlinService = module.get<GremlinService>(GremlinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
