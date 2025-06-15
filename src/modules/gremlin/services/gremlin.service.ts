import {Injectable, OnModuleInit, OnModuleDestroy, Logger, NotFoundException} from '@nestjs/common';
import {process as gprocess, driver} from 'gremlin';
import {PersonDto} from '../../person/dto/person.dto';

@Injectable()
export class GremlinService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(GremlinService.name);
    private client: driver.Client;
    public g: gprocess.GraphTraversalSource;

    async onModuleInit() {
        const remoteUrl = process.env.GREMLIN_REMOTE_URL || 'ws://localhost:8182/gremlin';

        this.client = new driver.Client(remoteUrl, {traversalSource: 'g'});

        try {
            await this.client.open();
            this.g = gprocess.traversal().withRemote(new driver.DriverRemoteConnection(remoteUrl, {}));
            this.logger.log(`Gremlin client connected to ${remoteUrl}`);
        } catch (error) {
            this.logger.error(`Failed to connect to Gremlin Server at ${remoteUrl}:`, error);
            throw error;
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            try {
                await this.client.close();
                this.logger.log('Gremlin client disconnected');
            } catch (error) {
                this.logger.error('Error disconnecting Gremlin client:', error);
            }
        }
    }

    async getPersonVertex(personId: string): Promise<any> {
        const { value: vertex } = await this.g.V(personId).next();
        if (!vertex) {
            throw new NotFoundException(`Person with ID ${personId} not found`);
        }
        const properties = await this.g.V(personId).valueMap(true).next();
        return properties.value;
    }

    async addPersonVertex(personId: string, properties: { name: string, email: string }): Promise<void> {
        const { value: vertex } = await this.g.V(personId).next();
        if (vertex) {
            await this.g.V(personId)
                .property('name', properties.name)
                .property('email', properties.email)
                .next();
        } else {
            await this.g.addV('person')
                .property(gprocess.t.id, personId)
                .property('name', properties.name)
                .property('email', properties.email)
                .next();
        }
    }
    
    async removePersonVertex(personId: string): Promise<void> {
        const { value: vertex } = await this.g.V(personId).next();
        if (!vertex) {
            throw new NotFoundException(`Person with ID ${personId} not found`);
        }
        await this.g.V(personId).drop().iterate();
        this.logger.log(`Person vertex with ID ${personId} removed`);
    }

    async addFriendship(person1Id: string, person2Id: string): Promise<void> {
        if (person1Id === person2Id) return;

        const { value: edge1 } = await this.g.V(person1Id).outE('has_friend').where(gprocess.statics.otherV().hasId(person2Id)).next();
        if (!edge1) {
            await this.g.V(person1Id).addE('has_friend').to(this.g.V(person2Id)).next();
        }

        const { value: edge2 } = await this.g.V(person2Id).outE('has_friend').where(gprocess.statics.otherV().hasId(person1Id)).next();
        if (!edge2) {
            await this.g.V(person2Id).addE('has_friend').to(this.g.V(person1Id)).next();
        }
    }

    async getFriends(personId: string): Promise<PersonDto[]> {
        const { value: vertex } = await this.g.V(personId).next();
        if (!vertex) {
            throw new NotFoundException(`Person with ID ${personId} not found`);
        }
        
        const friends = await this.g.V(personId).both('has_friend').valueMap(true).toList();
        return friends.map(friend => {

            const friendObj = friend as any;
            return {
                id: friendObj.id ? friendObj.id.toString() : personId,
                name: friendObj.name && Array.isArray(friendObj.name) ? friendObj.name[0].toString() : '',
                email: friendObj.email && Array.isArray(friendObj.email) ? friendObj.email[0].toString() : undefined
            };
        });
    }

    async getFriendIds(personId: string): Promise<string[]> {
        const friendVertices = await this.g.V(personId).both('has_friend').id().toList();
        return friendVertices as string[];
    }

    async removeFriendship(person1Id: string, person2Id: string): Promise<void> {
        await this.g.V(person1Id).bothE('has_friend').where(gprocess.statics.otherV().hasId(person2Id)).drop().iterate();
        this.logger.log(`Friendship removed between ${person1Id} and ${person2Id}`);
    }
}