import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PersonModule} from './modules/person/person.module';
import {BankAccountModule} from './modules/bank-account/bank-account.module';
import {BankTransactionModule} from './modules/bank-transaction/bank-transaction.module';
import {TestModule} from './modules/test/test.module';
import {typeOrmConfig} from "./typeorm.config";
import {BankProcessModule} from './modules/bank-process/bank-process.module';
import {GremlinModule} from "./modules/gremlin/gremlin.module";
import {SeedModule} from './modules/seed/seed.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRootAsync({
            useFactory: typeOrmConfig,
            inject: [ConfigService],
        }),
        PersonModule,
        BankAccountModule,
        BankTransactionModule,
        BankProcessModule,
        TestModule,
        GremlinModule,
        SeedModule,
    ],
})
export class AppModule {
}