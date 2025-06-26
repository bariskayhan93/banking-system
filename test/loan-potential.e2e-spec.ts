import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Loan Potential (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/seed (POST) should populate database', () => {
    return request(app.getHttpServer())
      .post('/seed')
      .expect(201)
      .expect(res => {
        expect(res.body.message).toContain('successfully');
      });
  });

  it('/persons (GET) should return seeded data', async () => {
    await request(app.getHttpServer()).post('/seed');

    return request(app.getHttpServer())
      .get('/persons')
      .expect(200)
      .expect(res => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
        expect(res.body[0]).toHaveProperty('netWorth');
      });
  });

  it('/processes/persons/:id/loan-potential (GET) should calculate loan potential', async () => {
    await request(app.getHttpServer()).post('/seed');

    const personsResponse = await request(app.getHttpServer()).get('/persons');
    const personId = personsResponse.body[0].id;

    return request(app.getHttpServer())
      .get(`/processes/persons/${personId}/loan-potential`)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('personId', personId);
        expect(res.body).toHaveProperty('personNetWorth');
        expect(res.body).toHaveProperty('maxLoanAmount');
        expect(res.body).toHaveProperty('friendContributions');
        expect(res.body).toHaveProperty('calculationMethod');
        expect(typeof res.body.maxLoanAmount).toBe('number');
      });
  });
});
