import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from './server.js';
import { Server as SocketIOServer } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';

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

  describe('Socket.io', () => {
    it('should have Socket.io server attached', () => {
      expect(server.io).toBeDefined();
      expect(server.io).toBeInstanceOf(SocketIOServer);
    });

    it('should accept Socket.io connections', (done) => {
      const address = server.httpServer.address();
      if (!address || typeof address === 'string') {
        done(new Error('Server address not available'));
        return;
      }

      const port = address.port;
      const client = Client(`http://localhost:${port}`);

      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.disconnect();
        done();
      });

      client.on('connect_error', (err) => {
        done(err);
      });
    });
  });
});
