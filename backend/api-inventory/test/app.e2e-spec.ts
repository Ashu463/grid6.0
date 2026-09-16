import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) is reachable without a token', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });

  it('/auth/users/:userId (GET) requires a bearer token', () => {
    return request(app.getHttpServer())
      .get('/auth/users/some-id')
      .expect(401);
  });
});
