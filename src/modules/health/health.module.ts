import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { GremlinModule } from '../gremlin/gremlin.module';

@Module({
  imports: [GremlinModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}