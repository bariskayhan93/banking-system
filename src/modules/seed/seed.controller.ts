import {Controller, Get, ParseIntPipe, Post} from '@nestjs/common';
import {SeedService} from './seed.service';
import {ApiTags, ApiOperation, ApiResponse, ApiQuery} from '@nestjs/swagger';
import {Query} from "@nestjs/common";

@ApiTags('seed')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) {
    }

    @Get('status')
    @ApiOperation({summary: 'Check if database is seeded'})
    @ApiResponse({status: 200, description: 'Returns seeding status'})
    async checkStatus() {
        const isSeeded = await this.seedService.checkIfSeeded();
        return {seeded: isSeeded};
    }

    @Post('all')
    @ApiOperation({summary: 'Reset and reseed all entities'})
    @ApiResponse({status: 200, description: 'Database reset and reseeded successfully'})
    async resetAndReseedAll() {
        await this.seedService.resetAndReseed();
        return {message: 'Database reset and reseeded successfully'};
    }

    @Post('persons')
    @ApiOperation({summary: 'Seed person entities only'})
    @ApiQuery({name: 'count', required: false, description: 'Number of persons to create'})
    @ApiResponse({status: 200, description: 'Persons seeded successfully'})
    async seedPersons(@Query('count', new ParseIntPipe({optional: true})) count?: number) {
        const persons = await this.seedService.seedPersonsOnly(count || 7);
        return {message: `${persons.length} persons seeded successfully`, persons};
    }

    @Post('bank-accounts')
    @ApiOperation({summary: 'Seed bank accounts for existing persons'})
    @ApiQuery({name: 'accountsPerPerson', required: false, description: 'Max accounts per person'})
    @ApiResponse({status: 200, description: 'Bank accounts seeded successfully'})
    async seedBankAccounts(
        @Query('accountsPerPerson', new ParseIntPipe({optional: true})) accountsPerPerson?: number
    ) {
        const accounts = await this.seedService.seedBankAccountsOnly(accountsPerPerson || 3);
        return {message: `${accounts.length} bank accounts seeded successfully`};
    }

    @Post('transactions')
    @ApiOperation({summary: 'Seed transactions for existing bank accounts'})
    @ApiQuery({name: 'maxPerAccount', required: false, description: 'Max transactions per account'})
    @ApiResponse({status: 200, description: 'Transactions seeded successfully'})
    async seedTransactions(
        @Query('maxPerAccount', new ParseIntPipe({optional: true})) maxPerAccount?: number
    ) {
        const count = await this.seedService.seedTransactionsOnly(maxPerAccount || 10);
        return {message: `${count} transactions seeded successfully`};
    }

    @Post('friendships')
    @ApiOperation({summary: 'Generate friendship relationships in graph database'})
    @ApiResponse({status: 200, description: 'Friendships seeded successfully'})
    async seedFriendships() {
        const count = await this.seedService.seedFriendshipsOnly();
        return {message: `${count} friendships seeded successfully`};
    }
}