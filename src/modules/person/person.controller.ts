import { Controller, Get } from '@nestjs/common';
import { PersonService } from './person.service';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get('seed')
  async seedOne() {
    return this.personService.createTest();
  }

  @Get()
  async all() {
    return this.personService.findAll();
  }
}
