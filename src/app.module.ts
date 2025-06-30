import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GremlinModule } from './modules/gremlin/gremlin.module';
import { PersonModule } from './modules/person/person.module';
import { BankAccountModule } from './modules/bank-account/bank-account.module';
import { BankTransactionModule } from './modules/bank-transaction/bank-transaction.module';
import { BankProcessModule } from './modules/bank-process/bank-process.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuthModule } from './common/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { MyBankingModule } from './modules/my-banking/my-banking.module';
import { HealthModule } from './modules/health/health.module';
import {typeOrmConfig} from "./typeorm.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => typeOrmConfig(configService),
    }),
    GremlinModule,
    PersonModule,
    BankAccountModule,
    BankTransactionModule,
    BankProcessModule,
    SeedModule,
    AuthModule,
    AdminModule,
    MyBankingModule,
    HealthModule,
  ],
})
export class AppModule {}
