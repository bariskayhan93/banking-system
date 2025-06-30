import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GremlinService } from '../gremlin/services/gremlin.service';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly gremlinService: GremlinService,
  ) {}

  async getBasicHealth(): Promise<HealthResponseDto> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  async getDetailedHealth(): Promise<HealthResponseDto> {
    const basic = await this.getBasicHealth();
    
    try {
      // Check PostgreSQL connection
      await this.dataSource.query('SELECT 1');
      const postgresStatus = 'connected';

      // Check Gremlin connection
      let gremlinStatus = 'disconnected';
      try {
        await this.gremlinService.testConnection();
        gremlinStatus = 'connected';
      } catch (error) {
        gremlinStatus = `error: ${error.message}`;
      }

      return {
        ...basic,
        services: {
          database: {
            postgres: postgresStatus,
            gremlin: gremlinStatus,
          },
        },
      };
    } catch (error) {
      return {
        ...basic,
        status: 'error',
        services: {
          database: {
            postgres: `error: ${error.message}`,
            gremlin: 'not checked',
          },
        },
      };
    }
  }
}