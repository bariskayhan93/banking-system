import {Module, Global} from '@nestjs/common';
import {GremlinService} from './services/gremlin.service';

@Global()
@Module({
    providers: [GremlinService],
    exports: [GremlinService],
})
export class GremlinModule {}
