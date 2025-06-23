import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BankProcessController} from './bank-process.controller';
import {BankProcessService} from './bank-process.service';
import {BankProcessRepository} from './repositories/bank-process.repository';
import {PersonRepository} from '../person/repositories/person.repository';
import {Person} from '../person/entities/person.entity';
import {GremlinService} from '../gremlin/services/gremlin.service';
import {ConfigService} from '@nestjs/config';

@Module({
    imports: [TypeOrmModule.forFeature([Person])],
    controllers: [BankProcessController],
    providers: [
        BankProcessService,
        BankProcessRepository,
        PersonRepository,
        GremlinService,
        ConfigService,
    ],
})
export class BankProcessModule {
}
