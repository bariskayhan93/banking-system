import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '../../common/decorators/api-response.decorator';
import { SeedResponseDto } from './dto/seed-response.dto';

@ApiTags('seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Reset and reseed all entities' })
  @ApiOkResponse(SeedResponseDto, 'Database reset and reseeded successfully')
  async resetAndReseedAll(): Promise<SeedResponseDto> {
    await this.seedService.resetAndReseed();
    return { message: 'Database reset and reseeded successfully' };
  }
}