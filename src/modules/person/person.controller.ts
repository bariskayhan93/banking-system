import {Controller, Get, Post, Body, Param, Delete, Put, ParseUUIDPipe, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiParam, ApiTags} from '@nestjs/swagger';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { PersonResponseDto } from './dto/person-response.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '../../common/decorators/api-response.decorator';
import {JwtAuthGuard} from "../../common/auth/jwt-auth.guard";

@ApiTags('persons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('persons')
export class PersonController {
  constructor(private readonly service: PersonService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiCreatedResponse(PersonResponseDto, 'Person successfully created')
  @ApiBadRequestResponse('Invalid input data')
  @ApiConflictResponse('Email address is already in use')
  async create(@Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.service.create(dto);
    return new PersonResponseDto(person);
  }

  @Get()
  @ApiOperation({ summary: 'Get all persons' })
  @ApiOkResponse(PersonResponseDto, 'List of all persons', true)
  async findAll(): Promise<PersonResponseDto[]> {
    const persons = await this.service.findAll();
    return persons.map(person => new PersonResponseDto(person));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiOkResponse(PersonResponseDto, 'Person found')
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid UUID format')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PersonResponseDto> {
    const person = await this.service.findOne(id);
    return new PersonResponseDto(person);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiOkResponse(PersonResponseDto, 'Person successfully updated')
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid input data or UUID format')
  @ApiConflictResponse('Email address is already in use')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePersonDto,
  ): Promise<PersonResponseDto> {
    const person = await this.service.update(id, dto);
    return new PersonResponseDto(person);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiNoContentResponse('Person deleted')
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid UUID format')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Post(':id/friends')
  @ApiOperation({ summary: 'Add a friend to a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiNoContentResponse('Friendship successfully created')
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid input data or UUID format')
  @ApiConflictResponse('Friendship already exists')
  async addFriend(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CreateFriendshipDto,
  ): Promise<void> {
    return this.service.addFriend(id, dto.friendId);
  }

  @Get(':id/friends')
  @ApiOperation({ summary: 'Get all friends of a person' })
  @ApiParam({ name: 'id', description: 'Person ID', type: String })
  @ApiOkResponse(PersonResponseDto, 'List of friends', true)
  @ApiNotFoundResponse('Person not found')
  @ApiBadRequestResponse('Invalid UUID format')
  async getFriends(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PersonResponseDto[]> {
    const friends = await this.service.getFriends(id);
    return friends.map(friend => new PersonResponseDto(friend));
  }
}
