import {Controller, Post, Get, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiOperation, ApiTags} from '@nestjs/swagger';
import { ApiOkResponse } from '../../common/decorators/api-response.decorator';
import { SeedService } from './seed.service';
import { SeedResponseDto } from './dto/seed-response.dto';
import { SeedStatusResponseDto } from './dto/seed-status-response.dto';
import {JwtAuthGuard} from "../../common/auth/jwt-auth.guard";

@ApiTags('seed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('seed')
export class SeedController {
  constructor(private readonly service: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Reset and reseed all entities' })
  @ApiOkResponse(SeedResponseDto, 'Database reset and reseeded successfully')
  async resetAndReseed(): Promise<SeedResponseDto> {
    await this.service.resetAndReseed();
    return { message: 'Database reset and reseeded successfully' };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check if database has been seeded' })
  @ApiOkResponse(SeedStatusResponseDto, 'Seeding status retrieved')
  async checkStatus(): Promise<SeedStatusResponseDto> {
    const isSeeded = await this.service.checkIfSeeded();
    return { seeded: isSeeded };
  }
}
