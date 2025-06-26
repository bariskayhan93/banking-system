import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PersonRepository {
  private readonly logger = new Logger(PersonRepository.name);

  constructor(
    @InjectRepository(Person)
    private readonly typeormRepo: Repository<Person>,
  ) {}

  async create(dto: CreatePersonDto): Promise<Person> {
    this.logger.log(`Creating person: ${dto.email}`);

    const person = this.typeormRepo.create({
      id: uuidv4(),
      ...dto,
    });
    return this.typeormRepo.save(person);
  }

  async findAll(): Promise<Person[]> {
    return this.typeormRepo.find();
  }

  async findById(id: string, relations: string[] = []): Promise<Person> {
    const person = await this.typeormRepo.findOne({
      where: { id },
      relations,
    });

    if (!person) {
      throw new NotFoundException(`Person ${id} not found`);
    }

    return person;
  }

  async findByIds(ids: string[]): Promise<Person[]> {
    if (!ids || ids.length === 0) return [];
    return this.typeormRepo.findBy({ id: In(ids) });
  }

  async findByEmail(email: string): Promise<Person | null> {
    return this.typeormRepo.findOne({ where: { email } });
  }

  async update(id: string, dto: UpdatePersonDto): Promise<Person> {
    await this.typeormRepo.update(id, dto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.typeormRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Person ${id} not found`);
    }
  }
}
