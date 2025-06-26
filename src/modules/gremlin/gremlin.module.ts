import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GremlinService } from './services/gremlin.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [GremlinService],
  exports: [GremlinService],
})
export class GremlinModule {}
