import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    ParseUUIDPipe,
    Logger,
} from '@nestjs/common';
import {ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import {PersonService} from './person.service';
import {CreatePersonDto} from './dto/create-person.dto';
import {UpdatePersonDto} from './dto/update-person.dto';
import {CreateFriendshipDto} from './dto/create-friendship.dto';
import {PersonResponseDto} from './dto/person-response.dto';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('persons')
@Controller('persons')
export class PersonController {
    private readonly logger = new Logger(PersonController.name);

    constructor(private readonly personService: PersonService) {
    }

    @Post()
    @ApiOperation({summary: 'Create a new person'})
    @ApiCreatedResponse(PersonResponseDto, 'The person has been successfully created')
    @ApiBadRequestResponse('Invalid input data')
    @ApiConflictResponse('Email address is already in use')
    async create(
        @Body() createPersonDto: CreatePersonDto,
    ): Promise<PersonResponseDto> {
        const person = await this.personService.create(createPersonDto);
        return new PersonResponseDto(person);
    }

    @Get()
    @ApiOperation({summary: 'Get all persons'})
    @ApiOkResponse(PersonResponseDto, 'List of all persons', true)
    async findAll(): Promise<PersonResponseDto[]> {
        const persons = await this.personService.findAll();
        return persons.map((person) => new PersonResponseDto(person));
    }

    @Get(':id')
    @ApiOperation({summary: 'Get a person by ID'})
    @ApiParam({name: 'id', description: 'Person ID', type: String})
    @ApiOkResponse(PersonResponseDto, 'The found person')
    @ApiNotFoundResponse('Person not found')
    @ApiBadRequestResponse('Invalid UUID format')
    async findOne(
        @Param('id', new ParseUUIDPipe({version: '4'})) id: string,
    ): Promise<PersonResponseDto> {
        const person = await this.personService.findOne(id);
        return new PersonResponseDto(person);
    }

    @Put(':id')
    @ApiOperation({summary: 'Update a person'})
    @ApiParam({name: 'id', description: 'Person ID', type: String})
    @ApiOkResponse(PersonResponseDto, 'The person has been successfully updated')
    @ApiNotFoundResponse('Person not found')
    @ApiBadRequestResponse('Invalid input data or UUID format')
    @ApiConflictResponse('Email address is already in use')
    async update(
        @Param('id', new ParseUUIDPipe({version: '4'})) id: string,
        @Body() updatePersonDto: UpdatePersonDto,
    ): Promise<PersonResponseDto> {
        const person = await this.personService.update(id, updatePersonDto);
        return new PersonResponseDto(person);
    }

    @Delete(':id')
    @ApiOperation({summary: 'Delete a person'})
    @ApiParam({name: 'id', description: 'Person ID', type: String})
    @ApiNoContentResponse('The person has been successfully deleted')
    @ApiNotFoundResponse('Person not found')
    @ApiBadRequestResponse('Invalid UUID format')
    async remove(
        @Param('id', new ParseUUIDPipe({version: '4'})) id: string,
    ): Promise<void> {
        return this.personService.remove(id);
    }

    @Post(':id/friends')
    @ApiOperation({summary: 'Add a friend to a person'})
    @ApiParam({name: 'id', description: 'Person ID', type: String})
    @ApiNoContentResponse('Friendship has been successfully created')
    @ApiNotFoundResponse('Person not found')
    @ApiBadRequestResponse(
        'Invalid input data, UUID format, or friendship already exists',
    )
    @ApiConflictResponse('Friendship already exists')
    async addFriend(
        @Param('id', new ParseUUIDPipe({version: '4'})) id: string,
        @Body() createFriendshipDto: CreateFriendshipDto,
    ): Promise<void> {
        this.logger.log(`Adding friend ${createFriendshipDto.friendId} to person ${id}`);
        return this.personService.addFriend(id, createFriendshipDto.friendId);
    }

    @Get(':id/friends')
    @ApiOperation({summary: 'Get all friends of a person'})
    @ApiParam({name: 'id', description: 'Person ID', type: String})
    @ApiOkResponse(PersonResponseDto, 'List of all friends', true)
    @ApiNotFoundResponse('Person not found')
    @ApiBadRequestResponse('Invalid UUID format')
    async getFriends(
        @Param('id', new ParseUUIDPipe({version: '4'})) id: string,
    ): Promise<PersonResponseDto[]> {
        const friends = await this.personService.getFriends(id);
        return friends.map((friend) => new PersonResponseDto(friend));
    }
}