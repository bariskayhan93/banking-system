import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Person} from "../person/entities/person.entity";
import {ProcessService} from "./bank-process.service";
import {ProcessController} from "./bank-process.controller";
import {Friendship} from "../person/entities/friendship.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Person,Friendship])],
  providers: [ProcessService],
  controllers: [ProcessController],
})
export class BankProcessModule {}

