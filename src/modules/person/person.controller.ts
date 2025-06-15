import {Controller, Get, Post, Body, Param, Put, Delete} from '@nestjs/common';
import {PersonService} from './person.service';
import {CreatePersonDto} from './dto/create-person.dto';
import {UpdatePersonDto} from './dto/update-person.dto';

@Controller('person')
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Get('seed')
    async seedOne() {
        return this.personService.createTest();
    }

    @Get()
    findAll() {
        return this.personService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.personService.findOne(+id);
    }

    @Post()
    create(@Body() dto: CreatePersonDto) {
        return this.personService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
        return this.personService.update(+id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.personService.remove(+id);
    }
}
