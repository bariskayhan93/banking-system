import {Injectable, Logger, OnModuleInit, OnModuleDestroy} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import * as gremlin from 'gremlin';
import {GraphEdge, GraphLabel} from '../interfaces/gremlin.interface';

@Injectable()
export class GremlinService implements OnModuleInit, OnModuleDestroy {
    private client: gremlin.driver.Client;
    private readonly logger = new Logger(GremlinService.name);

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        const host = this.configService.get<string>('GREMLIN_HOST');
        const port = this.configService.get<number>('GREMLIN_PORT');
        const traversalSource = this.configService.get<string>('GREMLIN_TRAVERSAL_SOURCE', 'g');

        const url = `ws://${host}:${port}/gremlin`;
        this.logger.log(`Connecting to Gremlin server at ${url}`);

        this.client = new gremlin.driver.Client(url, {
            traversalSource,
            rejectUnauthorized: false,
        });

        try {
            await this.client.open();
            this.logger.log('Successfully connected to Gremlin server');
        } catch (error) {
            this.logger.error(`Failed to connect to Gremlin server: ${error.message}`);
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.logger.log('Disconnected from Gremlin server');
        }
    }

    // Person operations
    async addPersonVertex(id: string, name: string, email: string): Promise<void> {
        const query = "g.addV(personLabel).property('id', personId).property('name', personName).property('email', personEmail)";
        await this.executeQuery(query, {
            personLabel: GraphLabel.PERSON,
            personId: id,
            personName: name,
            personEmail: email
        });
    }

    async updatePersonVertex(id: string, properties: { name?: string; email?: string }): Promise<void> {
        if (Object.keys(properties).length === 0) {
            return;
        }
        let query = "g.V().has('person', 'id', personId)";
        const bindings: Record<string, any> = {personId: id};

        Object.entries(properties).forEach(([key, value]) => {
            if (value !== undefined) {
                const bindingKey = `val_${key}`;
                query += `.property('${key}', ${bindingKey})`;
                bindings[bindingKey] = value;
            }
        });

        await this.executeQuery(query, bindings);
    }

    async removePersonVertex(personId: string): Promise<void> {
        const query = "g.V().has('person', 'id', personId).drop()";
        await this.executeQuery(query, {personId});
    }

    // Friendship operations
    async friendshipExists(personId: string, friendId: string): Promise<boolean> {
        const query = "g.V().has('person', 'id', personId).out('has_friend').has('id', friendId).count()";
        const result = await this.executeQuery<number>(query, {personId, friendId});
        return result.length > 0 && result[0] > 0;
    }

    async addFriendshipEdge(personId: string, friendId: string): Promise<void> {
        const addEdgeQuery = `
            g.V().has('person', 'id', fromId).as('a').
              V().has('person', 'id', toId).
              coalesce(
                inE('has_friend').where(outV().has('id', fromId)),
                addE('has_friend').from('a')
              )
        `;

        await this.executeQuery(addEdgeQuery, {fromId: personId, toId: friendId});
        await this.executeQuery(addEdgeQuery, {fromId: friendId, toId: personId});
    }

    async findFriendIds(personId: string): Promise<string[]> {
        const query = "g.V().has('person', 'id', personId).out('has_friend').values('id')";
        return this.executeQuery<string>(query, {personId});
    }

    // Database maintenance
    async clearGraph(): Promise<void> {
        this.logger.warn('Clearing all data from the graph database');
        await this.executeQuery('g.V().drop()');
    }

    // Query execution
    public async executeQuery<T = any>(query: string, bindings: Record<string, any> = {}): Promise<T[]> {
        if (!this.client) {
            this.logger.error('Gremlin client is not connected.');
            throw new Error('Gremlin client not available');
        }
        try {
            const result = await this.client.submit(query, bindings);
            return result._items;
        } catch (error) {
            this.logger.error(`Query failed: ${error.message}`, `Query: ${query}`);
            throw error;
        }
    }
}
