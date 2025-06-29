import { Controller, Get, Post, Put, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { MyBankingService } from './my-banking.service';

@ApiTags('Personal Banking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('my')
export class MyBankingController {
  constructor(private readonly service: MyBankingService) {}

  @Get('profile')
  getProfile(@User() auth0User, @Query('include') include?: string) {
    return this.service.getProfile(auth0User, include);
  }

  @Put('profile')
  updateProfile(@User() auth0User, @Body() updateData: any) {
    return this.service.updateProfile(auth0User, updateData);
  }

  @Get('banking')
  getBanking(@User() auth0User, @Query('include') include?: string) {
    return this.service.getBanking(auth0User, include);
  }

  @Post('banking/transactions')
  createTransaction(@User() auth0User, @Body() transactionData: any) {
    return this.service.createTransaction(auth0User, transactionData);
  }

  @Post('social/friends')
  manageFriends(@User() auth0User, @Body() friendData: any) {
    return this.service.manageFriends(auth0User, friendData);
  }
}