import { Room, Client } from 'colyseus';
import { GameState } from '../schema/GameState';
import { Player } from '../schema/Player';

interface CursorMessage {
    x: number;
    y: number;
}

export class GameRoom extends Room<GameState> {
    onCreate() {
        this.setState(new GameState());

        this.onMessage('cursor', (client: Client, message: CursorMessage) => {
            const player = this.state.players.get(client.sessionId);

            if (player) {
                player.x = message.x;
                player.y = message.y;
                player.visible = true;
            }
        });

        this.onMessage('cursor_out', (client: Client) => {
            const player = this.state.players.get(client.sessionId);

            if (player)
                player.visible = false;
        });

        console.log('GameRoom created.');
    }

    onJoin(client: Client) {
        const player = new Player();
        player.id = client.sessionId;
        player.x = 0;
        player.y = 0;
        player.visible = false;

        this.state.players.set(client.sessionId, player);
        console.log(`Player joined: ${client.sessionId}.`);
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
        console.log(`Player left: ${client.sessionId}.`);
    }

    onDispose() {
        console.log('GameRoom disposed');
    }
}
