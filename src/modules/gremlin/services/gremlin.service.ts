import {Injectable, OnModuleInit, OnModuleDestroy, Logger} from '@nestjs/common';
import {process as gprocess, driver} from 'gremlin';

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

    private async ensurePersonVertex(personId: string): Promise<void> {
        const { value: vertex } = await this.g.V(personId).next();
        if (!vertex) {
            await this.g.addV('person').property(gprocess.t.id, personId).next();
        }
    }

    async addFriendship(person1Id: string, person2Id: string): Promise<void> {
        if (person1Id === person2Id) return;

        await this.ensurePersonVertex(person1Id);
        await this.ensurePersonVertex(person2Id);

        const { value: existingEdge } = await this.g.V(person1Id).outE('has_friend').where(gprocess.statics.otherV().hasId(person2Id)).next();
        if (!existingEdge) {
            await this.g.V(person1Id).addE('has_friend').to(this.g.V(person2Id)).next();
            this.logger.log(`Friendship added between ${person1Id} and ${person2Id}`);
        }
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