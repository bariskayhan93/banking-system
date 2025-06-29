import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonRepository } from './repositories/person.repository';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { Person } from './entities/person.entity';

describe('PersonService', () => {
  let service: PersonService;
  let repository: PersonRepository;
  let gremlinService: GremlinService;

  const mockPerson: Person = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Person',
    email: 'test@example.com',
    auth0UserId: 'auth0|1234567890',
    netWorth: 1000,
    bankAccounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPersonRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockGremlinService = {
    addPersonVertex: jest.fn(),
    updatePersonVertex: jest.fn(),
    removePersonVertex: jest.fn(),
    friendshipExists: jest.fn(),
    addFriendshipEdge: jest.fn(),
    findFriendIds: jest.fn(),
    detectFriendshipCycle: jest.fn().mockResolvedValue(false),
    getFriendshipNetworkStats: jest.fn().mockResolvedValue({
      directFriends: 0,
      friendsOfFriends: 0,
      networkSize: 0,
      maxDepth: 0,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: PersonRepository,
          useValue: mockPersonRepository,
        },
        {
          provide: GremlinService,
          useValue: mockGremlinService,
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    repository = module.get<PersonRepository>(PersonRepository);
    gremlinService = module.get<GremlinService>(GremlinService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new person', async () => {
      // Arrange
      const createPersonDto: CreatePersonDto = {
        name: 'Test Person',
        email: 'test@example.com',
      };
      mockPersonRepository.findByEmail.mockResolvedValue(null);
      mockPersonRepository.create.mockResolvedValue(mockPerson);
      mockGremlinService.addPersonVertex.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createPersonDto);

      // Assert
      expect(repository.findByEmail).toHaveBeenCalledWith(createPersonDto.email);
      expect(repository.create).toHaveBeenCalledWith(createPersonDto);
      expect(gremlinService.addPersonVertex).toHaveBeenCalledWith(
        mockPerson.id,
        mockPerson.name,
        mockPerson.email,
      );
      expect(result).toEqual(mockPerson);
    });

    it('should throw ConflictException if email exists', async () => {
      // Arrange
      const createPersonDto: CreatePersonDto = {
        name: 'Test Person',
        email: 'existing@example.com',
      };
      mockPersonRepository.findByEmail.mockResolvedValue(mockPerson);

      // Act & Assert
      await expect(service.create(createPersonDto)).rejects.toThrow(ConflictException);
      expect(mockPersonRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all persons', async () => {
      // Arrange
      mockPersonRepository.findAll.mockResolvedValue([mockPerson]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPerson]);
    });
  });

  describe('findOne', () => {
    it('should find a person by ID', async () => {
      // Arrange
      const personId = mockPerson.id;
      mockPersonRepository.findById.mockResolvedValue(mockPerson);

      // Act
      const result = await service.findOne(personId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(result).toEqual(mockPerson);
    });

    it('should propagate NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      mockPersonRepository.findById.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.findOne(personId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      // Arrange
      const personId = mockPerson.id;
      const updatePersonDto: UpdatePersonDto = { name: 'Updated Name' };
      const updatedPerson = { ...mockPerson, name: 'Updated Name' };

      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockPersonRepository.update.mockResolvedValue(updatedPerson);
      mockGremlinService.updatePersonVertex.mockResolvedValue(undefined);

      // Act
      const result = await service.update(personId, updatePersonDto);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(repository.update).toHaveBeenCalledWith(personId, updatePersonDto);
      expect(gremlinService.updatePersonVertex).toHaveBeenCalledWith(personId, updatePersonDto);
      expect(result).toEqual(updatedPerson);
    });

    it('should handle email conflict during update', async () => {
      // Arrange
      const personId = mockPerson.id;
      const updatePersonDto: UpdatePersonDto = { email: 'existing@example.com' };
      const existingPerson = { ...mockPerson, id: 'different-id', email: 'existing@example.com' };

      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockPersonRepository.findByEmail.mockResolvedValue(existingPerson);

      // Act & Assert
      await expect(service.update(personId, updatePersonDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a person and their graph data', async () => {
      // Arrange
      const personId = mockPerson.id;
      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockPersonRepository.remove.mockResolvedValue(undefined);
      mockGremlinService.removePersonVertex.mockResolvedValue(undefined);

      // Act
      await service.remove(personId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(repository.remove).toHaveBeenCalledWith(personId);
      expect(gremlinService.removePersonVertex).toHaveBeenCalledWith(personId);
    });
  });

  describe('addFriend', () => {
    it('should add a friendship between two people', async () => {
      // Arrange
      const personId = mockPerson.id;
      const friendId = 'friend-id';

      mockPersonRepository.findById.mockImplementation(async id => {
        if (id === personId || id === friendId) {
          return { ...mockPerson, id };
        }
      });
      mockGremlinService.friendshipExists.mockResolvedValue(false);
      mockGremlinService.addFriendshipEdge.mockResolvedValue(undefined);

      // Act
      await service.addFriend(personId, friendId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(repository.findById).toHaveBeenCalledWith(friendId);
      expect(gremlinService.friendshipExists).toHaveBeenCalledWith(personId, friendId);
      expect(gremlinService.addFriendshipEdge).toHaveBeenCalledWith(personId, friendId);
    });

    it('should throw BadRequestException when adding self as friend', async () => {
      // Arrange
      const personId = mockPerson.id;

      // Act & Assert
      await expect(service.addFriend(personId, personId)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when friendship already exists', async () => {
      // Arrange
      const personId = mockPerson.id;
      const friendId = 'friend-id';

      mockPersonRepository.findById.mockImplementation(async id => {
        if (id === personId || id === friendId) {
          return { ...mockPerson, id };
        }
      });
      mockGremlinService.friendshipExists.mockResolvedValue(true);

      // Act & Assert
      await expect(service.addFriend(personId, friendId)).rejects.toThrow(ConflictException);
    });
  });

  describe('getFriends', () => {
    it('should get all friends of a person', async () => {
      // Arrange
      const personId = mockPerson.id;
      const friendIds = ['friend-1', 'friend-2'];
      const friends = [
        { ...mockPerson, id: 'friend-1', name: 'Friend 1' },
        { ...mockPerson, id: 'friend-2', name: 'Friend 2' },
      ];

      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockGremlinService.findFriendIds.mockResolvedValue(friendIds);
      mockPersonRepository.findByIds.mockResolvedValue(friends);

      // Act
      const result = await service.getFriends(personId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(gremlinService.findFriendIds).toHaveBeenCalledWith(personId);
      expect(repository.findByIds).toHaveBeenCalledWith(friendIds);
      expect(result).toEqual(friends);
    });

    it('should return empty array when person has no friends', async () => {
      // Arrange
      const personId = mockPerson.id;

      mockPersonRepository.findById.mockResolvedValue(mockPerson);
      mockGremlinService.findFriendIds.mockResolvedValue([]);

      // Act
      const result = await service.getFriends(personId);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(gremlinService.findFriendIds).toHaveBeenCalledWith(personId);
      expect(repository.findByIds).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
