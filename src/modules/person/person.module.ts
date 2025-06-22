import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GremlinModule } from '../gremlin/gremlin.module';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Person } from './entities/person.entity';
import {PersonRepository} from "./repositories/person.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([Person]),
        GremlinModule,
    ],
    controllers: [PersonController],
    providers: [PersonService, PersonRepository],
    exports: [PersonService, PersonRepository],
})
export class PersonModule {}