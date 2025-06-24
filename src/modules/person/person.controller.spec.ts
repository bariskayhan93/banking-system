import {Test, TestingModule} from '@nestjs/testing';
import {ConflictException, NotFoundException} from '@nestjs/common';
import {PersonController} from './person.controller';
import {PersonService} from './person.service';
import {CreatePersonDto} from './dto/create-person.dto';
import {UpdatePersonDto} from './dto/update-person.dto';
import {CreateFriendshipDto} from './dto/create-friendship.dto';


describe('PersonController', () => {
  let controller: PersonController;
  let service: Partial<PersonService>;

  const mockPerson = { id: 'id', name: 'name', email: 'email', createdAt: new Date(), updatedAt: new Date() } as any;
  const mockFriend = { ...mockPerson, id: 'friend-id' } as any;
  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addFriend: jest.fn(),
    getFriends: jest.fn(),
  };

  beforeEach(async () => {
    service = mockService;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonController],
      providers: [{ provide: PersonService, useValue: service }],
    }).compile();
    controller = module.get<PersonController>(PersonController);
    jest.clearAllMocks();
  });

  it('should be defined', () => expect(controller).toBeDefined());

  describe('create', () => {
    it('creates a person', async () => {
      (service.create as jest.Mock).mockResolvedValue(mockPerson);
      const dto: CreatePersonDto = {} as any;
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expect.objectContaining({ id: mockPerson.id }));
    });

    it('throws ConflictException', async () => {
      (service.create as jest.Mock).mockRejectedValue(new ConflictException());
      await expect(controller.create({} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('returns array of persons', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([mockPerson]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('returns a person', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockPerson);
      const result = await controller.findOne('id');
      expect(service.findOne).toHaveBeenCalledWith('id');
      expect(result).toEqual(expect.objectContaining({ id: mockPerson.id }));
    });

    it('throws NotFoundException', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns a person', async () => {
      const dto: UpdatePersonDto = {} as any;
      (service.update as jest.Mock).mockResolvedValue(mockPerson);
      const result = await controller.update('id', dto);
      expect(service.update).toHaveBeenCalledWith('id', dto);
      expect(result).toEqual(expect.objectContaining({ id: mockPerson.id }));
    });

    it('throws ConflictException', async () => {
      (service.update as jest.Mock).mockRejectedValue(new ConflictException());
      await expect(controller.update('id', {} as any)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException', async () => {
      (service.update as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.update('id', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes a person', async () => {
      (service.remove as jest.Mock).mockResolvedValue(undefined);
      await controller.remove('id');
      expect(service.remove).toHaveBeenCalledWith('id');
    });

    it('throws NotFoundException', async () => {
      (service.remove as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.remove('id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addFriend', () => {
    it('adds friend', async () => {
      const dto: CreateFriendshipDto = {} as any;
      (service.addFriend as jest.Mock).mockResolvedValue(undefined);
      await controller.addFriend('id', dto);
      expect(service.addFriend).toHaveBeenCalledWith('id', dto.friendId);
    });

    it('throws NotFoundException', async () => {
      (service.addFriend as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.addFriend('id', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFriends', () => {
    it('returns friends', async () => {
      (service.getFriends as jest.Mock).mockResolvedValue([mockFriend]);
      const result = await controller.getFriends('id');
      expect(service.getFriends).toHaveBeenCalledWith('id');
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundException', async () => {
      (service.getFriends as jest.Mock).mockRejectedValue(new NotFoundException());
      await expect(controller.getFriends('id')).rejects.toThrow(NotFoundException);
    });
  });
});
