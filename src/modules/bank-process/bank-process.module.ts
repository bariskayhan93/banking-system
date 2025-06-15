import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Person} from "../person/entities/person.entity";
import {BankProcessService} from "./bank-process.service";
import {BankProcessController} from "./bank-process.controller";
import {Friendship} from "../person/entities/friendship.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Person,Friendship])],
  providers: [BankProcessService],
  controllers: [BankProcessController],
})
export class BankProcessModule {}

