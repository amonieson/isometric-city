import { Server as SocketIOServer } from 'socket.io';
import type { GameState } from '../../shared/types/game.js';
import type { PlayerInfo } from '../../shared/types/messages.js';

export class Room {
  private readonly id: string;
  private readonly code: string;
  private players: Map<string, PlayerInfo> = new Map();
  private gameState: GameState | null = null;
  private readonly io: SocketIOServer;
  private readonly maxPlayers: number = 2;

  constructor(id: string, code: string, io: SocketIOServer) {
    this.id = id;
    this.code = code;
    this.io = io;
  }

  getId(): string {
    return this.id;
  }

  getCode(): string {
    return this.code;
  }

  addPlayer(player: PlayerInfo): boolean {
    if (this.isFull()) {
      return false;
    }
    this.players.set(player.id, player);
    return true;
  }

  removePlayer(playerId: string): boolean {
    return this.players.delete(playerId);
  }

  getPlayers(): PlayerInfo[] {
    return Array.from(this.players.values());
  }

  getPlayer(playerId: string): PlayerInfo | undefined {
    return this.players.get(playerId);
  }

  isFull(): boolean {
    return this.players.size >= this.maxPlayers;
  }

  setGameState(state: GameState): void {
    this.gameState = state;
  }

  getGameState(): GameState | null {
    return this.gameState;
  }

  broadcast(event: string, data: unknown): void {
    this.io.to(this.id).emit(event, data);
  }

  broadcastToOthers(socketId: string, event: string, data: unknown): void {
    this.io.to(this.id).except(socketId).emit(event, data);
  }
}

