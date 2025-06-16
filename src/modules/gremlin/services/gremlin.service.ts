import {Injectable, OnModuleInit, OnModuleDestroy, Logger, NotFoundException} from '@nestjs/common';
import {process as gprocess, driver} from 'gremlin';
import {PersonDto} from '../../person/dto/person.dto';

@Injectable()
export class GremlinService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(GremlinService.name);
  private client: driver.Client;
  public g: gprocess.GraphTraversalSource;

  async onModuleInit() {
    const url = process.env.GREMLIN_REMOTE_URL || 'ws://localhost:8182/gremlin';
    this.client = new driver.Client(url, { traversalSource: 'g' });
    
    try {
      await this.client.open();
      this.g = gprocess.traversal().withRemote(new driver.DriverRemoteConnection(url));
      this.logger.log(`Connected to Gremlin Server at ${url}`);
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.close().catch(e => this.logger.error(e));
  }

  async getPerson(id: string): Promise<Record<string, any>> {
    const vertex = await this.g.V(id).valueMap(true).next();
    if (!vertex.value) throw new NotFoundException(`Person ${id} not found`);
    return vertex.value;
  }

  async savePerson(id: string, { name, email }: { name: string; email: string }): Promise<void> {
    await (await this.g.V(id).hasNext() 
      ? this.g.V(id).property('name', name).property('email', email)
      : this.g.addV('person').property(gprocess.t.id, id).property('name', name).property('email', email)
    ).next();
  }

  async deletePerson(id: string): Promise<void> {
    if (!await this.g.V(id).hasNext()) throw new NotFoundException(`Person ${id} not found`);
    await this.g.V(id).drop().iterate();
  }

  // Edge operations
  async addFriend(a: string, b: string): Promise<void> {
    if (a === b) return;
    if (!await this.g.V(a).bothE('has_friend').where(gprocess.statics.otherV().hasId(b)).hasNext()) {
      await this.g.V(a).addE('has_friend').to(gprocess.statics.V(b)).next();
    }
  }

  async removeFriend(a: string, b: string): Promise<void> {
    await this.g.V(a).bothE('has_friend').where(gprocess.statics.otherV().hasId(b)).drop().iterate();
  }

  async getFriends(id: string): Promise<PersonDto[]> {
    const friends = await this.g.V(id).both('has_friend').valueMap(true).toList();
    return friends.map((f:any) => ({
      id: f.id?.toString(),
      name: f.name?.[0]?.toString() || '',
      email: f.email?.[0]?.toString()
    }));
  }

  async clearAll(): Promise<void> {
    await this.g.V().drop().iterate();
  }
}