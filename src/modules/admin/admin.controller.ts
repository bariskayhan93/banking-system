import {Controller, Get, UseGuards, Request} from '@nestjs/common';
import {ApiOperation, ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {JwtAuthGuard} from '../../common/auth/jwt-auth.guard';
import {PersonService} from '../person/person.service';
import {BankAccountService} from '../bank-account/bank-account.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
      private readonly personService: PersonService,
      private readonly bankAccountService: BankAccountService,
  ) {
  }

  @Get('dashboard')
  @ApiOperation({summary: 'Get admin dashboard data'})
  async getDashboard(@Request() req) {
    const [persons, accounts] = await Promise.all([
      this.personService.findAll(),
      this.bankAccountService.findAll(),
    ]);

    return {
      user: req.user,
      stats: {
        totalPersons: persons.length,
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
      },
      persons: persons.slice(0, 5),// Latest 5
      accounts: accounts.slice(0, 5),
    };
  }

  @Get('users/me')
  @ApiOperation({summary: 'Get current user profile'})
  async getProfile(@Request() req) {
    return {
      user: req.user,
      permissions: ['admin:read', 'admin:write'],
    };
  }
}