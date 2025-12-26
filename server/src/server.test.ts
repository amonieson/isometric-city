import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from './server.js';

describe('Server', () => {
  let server: ReturnType<typeof createServer>;

  beforeAll(() => {
    server = createServer(0); // Use port 0 for random available port
  });

  afterAll(() => {
    server.close();
  });

  describe('Health Check', () => {
    it('should respond to GET /health with 200 status', async () => {
      const response = await request(server.app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return JSON content type', async () => {
      const response = await request(server.app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});

