import {Controller, Get, HttpStatus, Post} from '@nestjs/common';
import {SeedService} from './seed.service';
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {
    }

    @Get('status')
    @ApiOperation({summary: 'Check if database is seeded'})
    @ApiResponse({
      status: HttpStatus.OK, 
      description: 'Returns seeding status',
      schema: {
        type: 'object',
        properties: {
          seeded: {
            type: 'boolean',
            example: true,
            description: 'Whether the database has been seeded'
          }
        }
      }
    })
    async checkStatus() {
        const isSeeded = await this.seedService.checkIfSeeded();
        return {seeded: isSeeded};
    }

    @Post('all')
    @ApiOperation({summary: 'Reset and reseed all entities'})
    @ApiResponse({
      status: HttpStatus.OK, 
      description: 'Database reset and reseeded successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Database reset and reseeded successfully'
          }
        }
      }
    })
    async resetAndReseedAll() {
        await this.seedService.resetAndReseed();
        return {message: 'Database reset and reseeded successfully'};
    }
}