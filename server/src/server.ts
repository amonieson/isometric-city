import express, { Express, Request, Response } from 'express';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';

export interface ServerInstance {
  app: Express;
  httpServer: HttpServer;
  io: SocketIOServer;
  close: () => void;
}

export function createServer(port: number = 3001): ServerInstance {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Create HTTP server
  const httpServer = createHttpServer(app);

  // Create Socket.io server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Start server
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return {
    app,
    httpServer,
    io,
    close: () => {
      io.close();
      httpServer.close();
    },
  };
}

// Start server if this file is run directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('server.ts')) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  createServer(port);
}

