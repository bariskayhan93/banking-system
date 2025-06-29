import { Injectable, Logger } from '@nestjs/common';
import { PersonService } from '../../modules/person/person.service';
import { Person } from '../../modules/person/entities/person.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly personService: PersonService) {}

  async resolve(auth0User: any): Promise<Person | null> {
    try {
      let person = await this.personService.findByAuth0UserId(auth0User.sub);
      
      if (!person && this.isValid(auth0User)) {
        person = await this.personService.createFromAuth0({
          name: auth0User.name || auth0User.email?.split('@')[0] || 'User',
          email: auth0User.email,
          auth0UserId: auth0User.sub
        });
      }
      
      return person;
    } catch (error) {
      this.logger.error(`User resolution failed for ${auth0User.sub}:`, error);
      return null;
    }
  }

  private isValid(auth0User: any): boolean {
    return auth0User.email && auth0User.iss === `${process.env.AUTH0_DOMAIN}/`;
  }
}