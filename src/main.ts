import '../styles/main.scss';
import { Scene } from './scene';
import { ConnectionManager } from './connection-manager';

const connectionManager = new ConnectionManager(import.meta.env.VITE_WEBSOCKET_URL);

connectionManager.on('open', () => {
    connectionManager.send({ type: 'PING', data: 'Hello there' });
});

connectionManager.on('message', (data) => {
    console.log('Got message:', data);
});

new Scene();
