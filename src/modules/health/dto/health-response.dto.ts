import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Overall health status' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Timestamp of health check' })
  timestamp: string;

  @ApiProperty({ example: 'development', description: 'Current environment' })
  environment: string;

  @ApiProperty({ example: '1.0.0', description: 'Application version' })
  version: string;

  @ApiProperty({
    example: {
      database: {
        postgres: 'connected',
        gremlin: 'connected'
      }
    },
    description: 'Service status details',
    required: false
  })
  services?: {
    database: {
      postgres: string;
      gremlin: string;
    };
  };
}