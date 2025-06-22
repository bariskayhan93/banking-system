import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { PersonResponseDto } from './dto/person-response.dto';

@ApiTags('persons')
@Controller('persons')
export class PersonController {
  private readonly logger = new Logger(PersonController.name);

  constructor(private readonly personService: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The person has been successfully created',
    type: PersonResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async create(@Body() createPersonDto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.personService.create(createPersonDto);
    return new PersonResponseDto(person);
  }

  @Get()
  @ApiOperation({ summary: 'Get all persons' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all persons',
    type: [PersonResponseDto],
  })
  async findAll(): Promise<PersonResponseDto[]> {
    const persons = await this.personService.findAll();
    return persons.map(person => new PersonResponseDto(person));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found person',
    type: PersonResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Person not found' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  async findOne(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PersonResponseDto> {
    const person = await this.personService.findOne(id);
    return new PersonResponseDto(person);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The person has been successfully updated',
    type: PersonResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Person not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data or UUID format' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  async update(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
      @Body() updatePersonDto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    const person = await this.personService.update(id, updatePersonDto);
    return new PersonResponseDto(person);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The person has been successfully deleted',
  })
  @ApiNotFoundResponse({ description: 'Person not found' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  async remove(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.personService.remove(id);
  }

  @Post(':id/friends')
  @ApiOperation({ summary: 'Add a friend to a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Friendship has been successfully created',
  })
  @ApiNotFoundResponse({ description: 'Person not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data, UUID format, or friendship already exists' })
  async addFriend(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
      @Body() createFriendshipDto: CreateFriendshipDto,
  ): Promise<void> {
    this.logger.log(`Adding friend ${createFriendshipDto.friendId} to person ${id}`);
    return this.personService.addFriend(id, createFriendshipDto.friendId);
  }

  @Get(':id/friends')
  @ApiOperation({ summary: 'Get all friends of a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all friends',
    type: [PersonResponseDto],
  })
  @ApiNotFoundResponse({ description: 'Person not found' })
  @ApiBadRequestResponse({ description: 'Invalid UUID format' })
  async getFriends(
      @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PersonResponseDto[]> {
    const friends = await this.personService.getFriends(id);
    return friends.map(friend => new PersonResponseDto(friend));
  }
}