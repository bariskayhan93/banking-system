import {Controller, Get, Post, Body, Param, Put, Delete} from '@nestjs/common';
import {PersonService} from './person.service';
import {CreatePersonDto} from './dto/create-person.dto';
import {UpdatePersonDto} from './dto/update-person.dto';

@Controller('persons')
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Get()
    findAll() {
        return this.personService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.personService.findOne(id);
    }

    @Get(':id/friends')
    getFriends(@Param('id') id: string) {
        return this.personService.getFriends(id);
    }

    @Post(':id1/friends/:id2')
    makeFriends(@Param('id1') id1: string, @Param('id2') id2: string) {
        return this.personService.makeFriends(id1, id2);
    }

    @Post()
    create(@Body() dto: CreatePersonDto) {
        return this.personService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePersonDto) {
        return this.personService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.personService.remove(id);
    }
}
