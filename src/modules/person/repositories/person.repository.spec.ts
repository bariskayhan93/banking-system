import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PersonRepository } from './person.repository';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid to return predictable values
jest.mock('uuid');

describe('PersonRepository', () => {
  let repository: PersonRepository;
  let typeormRepo: Repository<Person>;

  const mockPerson: Person = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Person',
    email: 'test@example.com',
    netWorth: 1000,
    bankAccounts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Mock uuid.v4() to return a consistent ID for testing
    (uuidv4 as jest.Mock).mockReturnValue('123e4567-e89b-12d3-a456-426614174000');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonRepository,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            create: jest.fn().mockReturnValue(mockPerson),
            save: jest.fn().mockResolvedValue(mockPerson),
            find: jest.fn().mockResolvedValue([mockPerson]),
            findOne: jest.fn(),
            findBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<PersonRepository>(PersonRepository);
    typeormRepo = module.get<Repository<Person>>(getRepositoryToken(Person));

    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a person with UUID', async () => {
      // Arrange
      const createPersonDto: CreatePersonDto = {
        name: 'Test Person',
        email: 'test@example.com',
      };

      // Act
      const result = await repository.create(createPersonDto);

      // Assert
      expect(uuidv4).toHaveBeenCalled();
      expect(typeormRepo.create).toHaveBeenCalledWith({
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createPersonDto,
      });
      expect(typeormRepo.save).toHaveBeenCalledWith(mockPerson);
      expect(result).toEqual(mockPerson);
    });
  });

  describe('findAll', () => {
    it('should return all persons', async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(typeormRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockPerson]);
    });
  });

  describe('findById', () => {
    it('should find a person by ID', async () => {
      // Arrange
      const personId = mockPerson.id;
      jest.spyOn(typeormRepo, 'findOne').mockResolvedValueOnce(mockPerson);

      // Act
      const result = await repository.findById(personId);

      // Assert
      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { id: personId },
        relations: [],
      });
      expect(result).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      jest.spyOn(typeormRepo, 'findOne').mockResolvedValueOnce(null);

      // Act & Assert
      await expect(repository.findById(personId)).rejects.toThrow(NotFoundException);
      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { id: personId },
        relations: [],
      });
    });

    it('should include specified relations', async () => {
      // Arrange
      const personId = mockPerson.id;
      const relations = ['bankAccounts'];
      jest.spyOn(typeormRepo, 'findOne').mockResolvedValueOnce(mockPerson);

      // Act
      await repository.findById(personId, relations);

      // Assert
      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { id: personId },
        relations,
      });
    });
  });

  describe('findByIds', () => {
    it('should find persons by multiple IDs', async () => {
      // Arrange
      const ids = [mockPerson.id, 'another-id'];
      jest.spyOn(typeormRepo, 'findBy').mockResolvedValueOnce([mockPerson]);

      // Act
      const result = await repository.findByIds(ids);

      // Assert
      expect(typeormRepo.findBy).toHaveBeenCalledWith({ id: expect.any(Object) });
      expect(result).toEqual([mockPerson]);
    });

    it('should return empty array for empty ids array', async () => {
      // Act
      const result = await repository.findByIds([]);

      // Assert
      expect(typeormRepo.findBy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByEmail', () => {
    it('should find a person by email', async () => {
      // Arrange
      const email = mockPerson.email;
      jest.spyOn(typeormRepo, 'findOne').mockResolvedValueOnce(mockPerson);

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(typeormRepo.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockPerson);
    });

    it('should return null when email not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      jest.spyOn(typeormRepo, 'findOne').mockResolvedValueOnce(null);

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a person and return the updated entity', async () => {
      // Arrange
      const personId = mockPerson.id;
      const updatePersonDto: UpdatePersonDto = {
        name: 'Updated Name',
      };
      const updatedPerson = { ...mockPerson, name: 'Updated Name' };

      jest.spyOn(typeormRepo, 'update').mockResolvedValueOnce({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(updatedPerson);

      // Act
      const result = await repository.update(personId, updatePersonDto);

      // Assert
      expect(typeormRepo.update).toHaveBeenCalledWith(personId, updatePersonDto);
      expect(repository.findById).toHaveBeenCalledWith(personId);
      expect(result).toEqual(updatedPerson);
    });
  });

  describe('remove', () => {
    it('should remove a person', async () => {
      // Arrange
      const personId = mockPerson.id;
      jest.spyOn(typeormRepo, 'delete').mockResolvedValueOnce({
        affected: 1,
        raw: [],
      });

      // Act
      await repository.remove(personId);

      // Assert
      expect(typeormRepo.delete).toHaveBeenCalledWith(personId);
    });

    it('should throw NotFoundException when person to remove is not found', async () => {
      // Arrange
      const personId = 'non-existent-id';
      jest.spyOn(typeormRepo, 'delete').mockResolvedValueOnce({
        affected: 0,
        raw: [],
      });

      // Act & Assert
      await expect(repository.remove(personId)).rejects.toThrow(NotFoundException);
      expect(typeormRepo.delete).toHaveBeenCalledWith(personId);
    });
  });
});
