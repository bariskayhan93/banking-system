import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import { PersonService } from '../person/person.service';
import { BankAccountService } from '../bank-account/bank-account.service';
import { UserService } from '../../common/services/user.service';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly personService: PersonService,
    private readonly bankAccountService: BankAccountService,
    private readonly userService: UserService,
  ) {}

  @Get('users/me')
  @ApiOperation({ summary: 'Get current admin user profile' })
  @ApiOkResponse(Object, 'Admin user profile')
  @ApiNotFoundResponse('Admin user not found')
  async getProfile(@User() auth0User) {
    const user = await this.userService.resolve(auth0User);
    
    return {
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      permissions: ['admin:read', 'admin:write'],
    };
  }
}
