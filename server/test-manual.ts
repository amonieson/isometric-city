/**
 * Manual test script for server Socket.io functionality
 * Run with: npx tsx test-manual.ts
 */

import { io } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

console.log(`Connecting to server at ${SERVER_URL}...`);

const client = io(SERVER_URL, {
  autoConnect: true,
});

client.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Test 1: Create a room
  console.log('\n📝 Test 1: Creating room...');
  client.emit('createRoom', {
    type: 'createRoom',
    cityName: 'Manual Test City',
    gridSize: 50,
  });
});

client.on('roomCreated', (message) => {
  console.log('✅ Room created:', {
    roomId: message.roomId,
    roomCode: message.roomCode,
  });
});

client.on('roomJoined', (message) => {
  console.log('✅ Room joined:', {
    roomId: message.roomId,
    roomCode: message.roomCode,
    players: message.players.length,
    gameState: {
      cityName: message.gameState.cityName,
      gridSize: message.gameState.gridSize,
    },
  });
  console.log('\n✅ All tests passed! Server is working correctly.');
  console.log('Room code:', message.roomCode);
  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

client.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('\n💡 Make sure the server is running: npm run dev');
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Test timed out');
  process.exit(1);
}, 5000);

