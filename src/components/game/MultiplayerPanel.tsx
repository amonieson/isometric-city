'use client';

import React, { useState } from 'react';
import { useMultiplayerContext } from '@/context/MultiplayerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Check } from 'lucide-react';

export function MultiplayerPanel() {
  const {
    isConnected,
    connectionStatus,
    roomCode,
    players,
    error,
    createRoom,
    joinRoom,
  } = useMultiplayerContext();

  const [joinCode, setJoinCode] = useState('');
  const [cityName, setCityName] = useState('Multiplayer City');
  const [gridSize, setGridSize] = useState(50);
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = () => {
    createRoom(cityName, gridSize);
  };

  const handleJoinRoom = () => {
    if (joinCode.trim()) {
      joinRoom(joinCode.trim());
    }
  };

  const handleCopyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Multiplayer
        </CardTitle>
        <CardDescription>
          Play together with friends in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-sm text-muted-foreground">
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'disconnected' && 'Disconnected'}
            {connectionStatus === 'error' && 'Connection Error'}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Room Code Display */}
        {roomCode && (
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Room Code
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-2xl font-mono font-bold tracking-wider">
                {roomCode}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRoomCode}
                className="h-8"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this code with your friend to join
            </p>
          </div>
        )}

        {/* Players List */}
        {players.length > 0 && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Players ({players.length}/2)
            </Label>
            <div className="flex gap-2">
              {players.map((player) => (
                <Badge key={player.id} variant="secondary">
                  Player {player.id.slice(-4)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Create Room */}
        {!roomCode && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="cityName">City Name</Label>
              <Input
                id="cityName"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="My City"
              />
            </div>
            <div>
              <Label htmlFor="gridSize">Grid Size</Label>
              <Input
                id="gridSize"
                type="number"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value) || 50)}
                min={25}
                max={100}
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={!isConnected || connectionStatus === 'connecting'}
              className="w-full"
            >
              Create Room
            </Button>
          </div>
        )}

        {/* Join Room */}
        {!roomCode && (
          <div className="space-y-3 pt-4 border-t">
            <div>
              <Label htmlFor="joinCode">Room Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="font-mono text-center text-lg tracking-wider"
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={!isConnected || connectionStatus === 'connecting' || !joinCode.trim()}
              variant="outline"
              className="w-full"
            >
              Join Room
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

