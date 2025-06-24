import {Test, TestingModule} from '@nestjs/testing';
import {ConfigService} from '@nestjs/config';
import {GremlinService} from './gremlin.service';
import {GraphLabel} from '../interfaces/gremlin.interface';

// Mock the gremlin client
jest.mock('gremlin', () => {
    const originalModule = jest.requireActual('gremlin');
    return {
        ...originalModule,
        driver: {
            Client: jest.fn().mockImplementation(() => ({
                open: jest.fn().mockResolvedValue(undefined),
                close: jest.fn().mockResolvedValue(undefined),
                submit: jest.fn().mockImplementation((query) => ({
                    _items: []
                })),
            }))
        }
    };
});

describe('GremlinService', () => {
    let service: GremlinService;
    let mockClient;

    const mockConfigService = {
        get: jest.fn().mockImplementation((key, defaultValue) => {
            const config = {
                'GREMLIN_HOST': 'localhost',
                'GREMLIN_PORT': 8182,
                'GREMLIN_TRAVERSAL_SOURCE': 'g'
            };
            return config[key] || defaultValue;
        })
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GremlinService,
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ],
        }).compile();

        service = module.get<GremlinService>(GremlinService);

        // Wait for onModuleInit to complete
        await module.init();

        // Get access to the mock client inside the service
        mockClient = (service as any).client;
    });

    afterEach(async () => {
        await service.onModuleDestroy();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should connect to the gremlin server', async () => {
            // We expect the connection to have been made in beforeEach
            expect(mockConfigService.get).toHaveBeenCalledWith('GREMLIN_HOST');
            expect(mockConfigService.get).toHaveBeenCalledWith('GREMLIN_PORT');
            expect(mockConfigService.get).toHaveBeenCalledWith('GREMLIN_TRAVERSAL_SOURCE', 'g');
            expect(mockClient.open).toHaveBeenCalled();
        });
    });

    describe('onModuleDestroy', () => {
        it('should close the connection', async () => {
            await service.onModuleDestroy();
            expect(mockClient.close).toHaveBeenCalled();
        });
    });

    describe('executeQuery', () => {
        it('should execute a query and return results', async () => {
            // Arrange
            const query = 'g.V().count()';
            const mockItems = [5];
            mockClient.submit.mockImplementationOnce(() => ({
                _items: mockItems
            }));

            // Act
            const result = await service.executeQuery(query);

            // Assert
            expect(mockClient.submit).toHaveBeenCalledWith(query, {});
            expect(result).toEqual(mockItems);
        });

        it('should accept bindings parameters', async () => {
            // Arrange
            const query = 'g.V().has("id", id)';
            const bindings = {id: '123'};

            // Act
            await service.executeQuery(query, bindings);

            // Assert
            expect(mockClient.submit).toHaveBeenCalledWith(query, bindings);
        });

        it('should throw error when client is not available', async () => {
            // Arrange
            jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
            (service as any).client = null;

            // Act & Assert
            await expect(service.executeQuery('any-query'))
                .rejects
                .toThrow('Gremlin client not available');
        });

        it('should propagate errors from the query', async () => {
            // Arrange
            jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
            const errorMessage = 'Query execution failed';
            mockClient.submit.mockRejectedValueOnce(new Error(errorMessage));

            // Act & Assert
            await expect(service.executeQuery('invalid-query'))
                .rejects
                .toThrow();
        });
    });

    describe('Person operations', () => {
        const personId = '123e4567-e89b-12d3-a456-426614174000';
        const personName = 'Test Person';
        const personEmail = 'test@example.com';

        describe('addPersonVertex', () => {
            it('should add a person vertex to the graph', async () => {
                // Arrange
                const expectedQuery = "g.addV(personLabel).property('id', personId).property('name', personName).property('email', personEmail)";

                // Act
                await service.addPersonVertex(personId, personName, personEmail);

                // Assert
                expect(mockClient.submit).toHaveBeenCalledWith(expectedQuery, {
                    personLabel: GraphLabel.PERSON,
                    personId: personId,
                    personName: personName,
                    personEmail: personEmail
                });
            });
        });

        describe('updatePersonVertex', () => {
            it('should update a person vertex with new properties', async () => {
                // Arrange
                const updateProperties = {name: 'Updated Name'};

                // Act
                await service.updatePersonVertex(personId, updateProperties);

                // Assert
                expect(mockClient.submit).toHaveBeenCalled();
                // Check the first argument (query) contains the property update
                const query = mockClient.submit.mock.calls[0][0];
                expect(query).toContain("g.V().has('person', 'id', personId)");
                expect(query).toContain(".property('name', val_name)");

                // Check the bindings contain the correct values
                const bindings = mockClient.submit.mock.calls[0][1];
                expect(bindings.personId).toBe(personId);
                expect(bindings.val_name).toBe('Updated Name');
            });

            it('should not modify properties when update object is empty', async () => {
                // Arrange
                const updateProperties = {};

                // Act
                await service.updatePersonVertex(personId, updateProperties);

                // Assert
                expect(mockClient.submit).not.toHaveBeenCalled();
            });
        });

        describe('removePersonVertex', () => {
            it('should remove a person vertex from the graph', async () => {
                // Arrange
                const expectedQuery = "g.V().has('person', 'id', personId).drop()";

                // Act
                await service.removePersonVertex(personId);

                // Assert
                expect(mockClient.submit).toHaveBeenCalledWith(expectedQuery, {personId});
            });
        });
    });

    describe('Friendship operations', () => {
        const personId = '123e4567-e89b-12d3-a456-426614174000';
        const friendId = '223e4567-e89b-12d3-a456-426614174001';

        describe('friendshipExists', () => {
            it('should check if a friendship exists', async () => {
                // Arrange
                const expectedQuery = "g.V().has('person', 'id', personId).out('has_friend').has('id', friendId).count()";
                mockClient.submit.mockImplementationOnce(() => ({_items: [1]}));

                // Act
                const result = await service.friendshipExists(personId, friendId);

                // Assert
                expect(mockClient.submit).toHaveBeenCalledWith(expectedQuery, {
                    personId,
                    friendId
                });
                expect(result).toBe(true);
            });

            it('should return false when friendship does not exist', async () => {
                // Arrange
                mockClient.submit.mockImplementationOnce(() => ({_items: [0]}));

                // Act
                const result = await service.friendshipExists(personId, friendId);

                // Assert
                expect(result).toBe(false);
            });
        });

        describe('addFriendshipEdge', () => {
            it('should add bidirectional friendship edges', async () => {
                // Act
                await service.addFriendshipEdge(personId, friendId);

                // Assert
                expect(mockClient.submit).toHaveBeenCalledTimes(2); // Two calls for bidirectional relationship

                // First call should create edge from personId -> friendId
                const firstCallBindings = mockClient.submit.mock.calls[0][1];
                expect(firstCallBindings.fromId).toBe(personId);
                expect(firstCallBindings.toId).toBe(friendId);

                // Second call should create edge from friendId -> personId
                const secondCallBindings = mockClient.submit.mock.calls[1][1];
                expect(secondCallBindings.fromId).toBe(friendId);
                expect(secondCallBindings.toId).toBe(personId);
            });
        });

        describe('findFriendIds', () => {
            it('should retrieve IDs of friends', async () => {
                // Arrange
                const expectedQuery = "g.V().has('person', 'id', personId).out('has_friend').values('id')";
                const mockFriendIds = [friendId, 'another-friend-id'];
                mockClient.submit.mockImplementationOnce(() => ({_items: mockFriendIds}));

                // Act
                const result = await service.findFriendIds(personId);

                // Assert
                expect(mockClient.submit).toHaveBeenCalledWith(expectedQuery, {personId});
                expect(result).toEqual(mockFriendIds);
            });

            it('should return empty array when person has no friends', async () => {
                // Arrange
                mockClient.submit.mockImplementationOnce(() => ({_items: []}));

                // Act
                const result = await service.findFriendIds(personId);

                // Assert
                expect(result).toEqual([]);
            });
        });
    });

    describe('clearGraph', () => {
        it('should clear the entire graph', async () => {
            // Arrange
            const expectedQuery = 'g.V().drop()';

            // Act
            await service.clearGraph();

            // Assert
            expect(mockClient.submit).toHaveBeenCalledWith(expectedQuery, {});
        });
    });
});
