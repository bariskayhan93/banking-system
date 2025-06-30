import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as gremlin from 'gremlin';
import { GraphEdge, GraphLabel } from '../interfaces/gremlin.interface';

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
    const query =
      "g.addV(personLabel).property('id', personId).property('name', personName).property('email', personEmail)";
    await this.executeQuery(query, {
      personLabel: GraphLabel.PERSON,
      personId: id,
      personName: name,
      personEmail: email,
    });
  }

  async updatePersonVertex(
    id: string,
    properties: { name?: string; email?: string },
  ): Promise<void> {
    if (Object.keys(properties).length === 0) {
      return;
    }
    let query = "g.V().has('person', 'id', personId)";
    const bindings: Record<string, any> = { personId: id };

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
    await this.executeQuery(query, { personId });
  }

  // Friendship operations
  async friendshipExists(personId: string, friendId: string): Promise<boolean> {
    const query =
      "g.V().has('person', 'id', personId).out('has_friend').has('id', friendId).count()";
    const result = await this.executeQuery<number>(query, { personId, friendId });
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

    await this.executeQuery(addEdgeQuery, { fromId: personId, toId: friendId });
    await this.executeQuery(addEdgeQuery, { fromId: friendId, toId: personId });
  }

  async findFriendIds(personId: string): Promise<string[]> {
    const query = "g.V().has('person', 'id', personId).out('has_friend').values('id')";
    return this.executeQuery<string>(query, { personId });
  }

  // Bulk operations for large friend networks
  async findMultipleFriendIds(personIds: string[]): Promise<Map<string, string[]>> {
    if (personIds.length === 0) return new Map();

    const query = `
            g.V().has('person', 'id', within(personIds)).
            project('personId', 'friendIds').
            by('id').
            by(out('has_friend').values('id').fold())
        `;

    const results = await this.executeQuery<{ personId: string; friendIds: string[] }>(query, {
      personIds: personIds,
    });

    const friendsMap = new Map<string, string[]>();
    results.forEach(result => {
      friendsMap.set(result.personId, result.friendIds || []);
    });

    // Ensure all requested persons are in the map, even if they have no friends
    personIds.forEach(personId => {
      if (!friendsMap.has(personId)) {
        friendsMap.set(personId, []);
      }
    });

    return friendsMap;
  }

  async bulkAddFriendships(
    friendshipPairs: Array<{ personId: string; friendId: string }>,
  ): Promise<void> {
    if (friendshipPairs.length === 0) return;

    // Batch friendships into groups for better performance
    const batchSize = 50;
    const batches: Array<{ personId: string; friendId: string }[]> = [];

    for (let i = 0; i < friendshipPairs.length; i += batchSize) {
      batches.push(friendshipPairs.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(pair => this.addFriendshipEdge(pair.personId, pair.friendId));
      await Promise.all(promises);
    }
  }

  async getFriendNetworkBulk(
    personIds: string[],
    maxDegrees: number = 2,
  ): Promise<
    Map<
      string,
      {
        friends: string[];
        friendsOfFriends: string[];
        networkSize: number;
      }
    >
  > {
    if (personIds.length === 0) return new Map();

    const query = `
            g.V().has('person', 'id', within(personIds)).
            project('personId', 'directFriends', 'extendedNetwork').
            by('id').
            by(out('has_friend').values('id').fold()).
            by(repeat(out('has_friend')).times(maxDegrees).dedup().values('id').fold())
        `;

    const results = await this.executeQuery<{
      personId: string;
      directFriends: string[];
      extendedNetwork: string[];
    }>(query, { personIds, maxDegrees });

    const networkMap = new Map();

    results.forEach(result => {
      const directFriends = result.directFriends || [];
      const extendedNetwork = result.extendedNetwork || [];

      // Friends of friends = extended network - direct friends - self
      const friendsOfFriends = extendedNetwork.filter(
        id => !directFriends.includes(id) && id !== result.personId,
      );

      networkMap.set(result.personId, {
        friends: directFriends,
        friendsOfFriends: friendsOfFriends,
        networkSize: extendedNetwork.length,
      });
    });

    // Ensure all requested persons are in the map
    personIds.forEach(personId => {
      if (!networkMap.has(personId)) {
        networkMap.set(personId, {
          friends: [],
          friendsOfFriends: [],
          networkSize: 0,
        });
      }
    });

    return networkMap;
  }

  async getNetworkStatsBulk(personIds: string[]): Promise<
    Map<
      string,
      {
        directFriends: number;
        friendsOfFriends: number;
        networkSize: number;
        maxDepth: number;
      }
    >
  > {
    const networkData = await this.getFriendNetworkBulk(personIds, 3);
    const statsMap = new Map();

    networkData.forEach((data, personId) => {
      statsMap.set(personId, {
        directFriends: data.friends.length,
        friendsOfFriends: data.friendsOfFriends.length,
        networkSize: data.networkSize,
        maxDepth: data.networkSize > 0 ? 3 : 0,
      });
    });

    return statsMap;
  }

  // Database maintenance
  async clearGraph(): Promise<void> {
    this.logger.warn('Clearing all data from the graph database');
    await this.executeQuery('g.V().drop()');
  }

  // Cycle detection for friendship networks
  async detectFriendshipCycle(
    fromPersonId: string,
    toPersonId: string,
    maxDepth: number = 6,
  ): Promise<boolean> {
    // Check if adding this friendship would create a cycle
    // This uses BFS to detect if there's already a path from toPersonId to fromPersonId
    const query = `
            g.V().has('person', 'id', startId).
            repeat(out('has_friend')).
            times(maxDepth).
            has('id', endId).
            limit(1).
            count()
        `;

    const result = await this.executeQuery<number>(query, {
      startId: toPersonId,
      endId: fromPersonId,
      maxDepth: maxDepth,
    });

    return result.length > 0 && result[0] > 0;
  }

  // Find shortest path between two persons
  async findShortestPath(fromPersonId: string, toPersonId: string): Promise<string[]> {
    const query = `
            g.V().has('person', 'id', fromId).
            repeat(out('has_friend').simplePath()).
            until(has('id', toId)).
            limit(1).
            path().
            by('id')
        `;

    const result = await this.executeQuery<any>(query, {
      fromId: fromPersonId,
      toId: toPersonId,
    });

    return result.length > 0 ? result[0].objects : [];
  }

  // Get friendship network statistics
  async getFriendshipNetworkStats(personId: string): Promise<{
    directFriends: number;
    friendsOfFriends: number;
    networkSize: number;
    maxDepth: number;
  }> {
    // Direct friends
    const directFriendsQuery = "g.V().has('person', 'id', personId).out('has_friend').count()";
    const directFriendsResult = await this.executeQuery<number>(directFriendsQuery, { personId });
    const directFriends = directFriendsResult[0] || 0;

    // Friends of friends (2nd degree)
    const friendsOfFriendsQuery = `
            g.V().has('person', 'id', personId).as('start').
            out('has_friend').out('has_friend').
            where(neq('start')).
            dedup().count()
        `;
    const friendsOfFriendsResult = await this.executeQuery<number>(friendsOfFriendsQuery, {
      personId,
    });
    const friendsOfFriends = (friendsOfFriendsResult[0] || 0) - directFriends;

    // Network size up to 3 degrees
    const networkSizeQuery = `
            g.V().has('person', 'id', personId).
            repeat(out('has_friend')).
            times(3).
            dedup().count()
        `;
    const networkSizeResult = await this.executeQuery<number>(networkSizeQuery, { personId });
    const networkSize = networkSizeResult[0] || 0;

    return {
      directFriends,
      friendsOfFriends: Math.max(0, friendsOfFriends),
      networkSize,
      maxDepth: networkSize > 0 ? 3 : 0,
    };
  }

  // Health check
  async testConnection(): Promise<void> {
    if (!this.client) {
      throw new Error('Gremlin client not available');
    }
    try {
      await this.client.submit('g.V().limit(1).count()');
    } catch (error) {
      throw new Error(`Gremlin connection test failed: ${error.message}`);
    }
  }

  // Query execution
  public async executeQuery<T = any>(
    query: string,
    bindings: Record<string, any> = {},
  ): Promise<T[]> {
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
