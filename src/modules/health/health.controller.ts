import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: HealthResponseDto })
  async getHealth(): Promise<HealthResponseDto> {
    return this.healthService.getBasicHealth();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with database status' })
  @ApiResponse({ status: 200, description: 'Detailed health status', type: HealthResponseDto })
  async getDetailedHealth(): Promise<HealthResponseDto> {
    return this.healthService.getDetailedHealth();
  }
}