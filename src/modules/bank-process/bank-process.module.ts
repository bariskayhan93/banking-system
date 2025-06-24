import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BankProcessController} from './bank-process.controller';
import {BankProcessService} from './bank-process.service';
import {BankProcessRepository} from './repositories/bank-process.repository';
import {Person} from '../person/entities/person.entity';
import {GremlinModule} from '../gremlin/gremlin.module';
import {PersonModule} from '../person/person.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Person]),
        GremlinModule,
        PersonModule
    ],
    controllers: [BankProcessController],
    providers: [BankProcessService, BankProcessRepository],
    exports: [BankProcessService, BankProcessRepository]
})
export class BankProcessModule {
}
