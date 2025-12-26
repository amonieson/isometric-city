import type { GameAction } from './actions.js';
import type { GameState, Tile, Stats } from './game.js';
export interface JoinRoomMessage {
    type: 'joinRoom';
    roomCode: string;
}
export interface CreateRoomMessage {
    type: 'createRoom';
    cityName: string;
    gridSize: number;
}
export interface ActionMessage {
    type: 'action';
    action: GameAction;
}
export type ClientMessage = JoinRoomMessage | CreateRoomMessage | ActionMessage;
export interface RoomCreatedMessage {
    type: 'roomCreated';
    roomId: string;
    roomCode: string;
}
export interface RoomJoinedMessage {
    type: 'roomJoined';
    roomId: string;
    roomCode: string;
    gameState: GameState;
    players: PlayerInfo[];
}
export interface RoomJoinFailedMessage {
    type: 'roomJoinFailed';
    reason: 'room_not_found' | 'room_full' | 'invalid_code' | 'server_error';
}
export interface StateUpdateMessage {
    type: 'stateUpdate';
    changedTiles: Array<{
        x: number;
        y: number;
        tile: Tile | null;
    }>;
    stats?: Partial<Stats>;
    timestamp: number;
}
export interface PlayerJoinedMessage {
    type: 'playerJoined';
    player: PlayerInfo;
    players: PlayerInfo[];
}
export interface PlayerLeftMessage {
    type: 'playerLeft';
    playerId: string;
    players: PlayerInfo[];
}
export interface ErrorMessage {
    type: 'error';
    code: string;
    message: string;
    actionId?: string;
}
export interface FullStateMessage {
    type: 'fullState';
    gameState: GameState;
}
export interface PlayerInfo {
    id: string;
    socketId: string;
    name?: string;
    joinedAt: number;
}
export type ServerMessage = RoomCreatedMessage | RoomJoinedMessage | RoomJoinFailedMessage | StateUpdateMessage | PlayerJoinedMessage | PlayerLeftMessage | ErrorMessage | FullStateMessage;
//# sourceMappingURL=messages.d.ts.map