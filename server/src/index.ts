import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import { GameRoom } from './rooms/GameRoom';

const app = express();
const port = 2567;

app.use(express.json());

const httpServer = createServer(app);

const gameServer = new Server({
    server: httpServer,
});

gameServer.define('game', GameRoom);

httpServer.listen(port, () => {
    console.log(`Server listening on ws://localhost:${port}.`);
});
