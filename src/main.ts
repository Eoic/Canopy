import '../styles/main.scss';
import Alpine from 'alpinejs';
import { Scene } from './scene';
import { ConnectionManager } from './connection-manager';

// Network.
const connectionManager = new ConnectionManager(import.meta.env.VITE_WEBSOCKET_URL);

connectionManager.on('open', () => {
    connectionManager.send({ type: 'PING', data: 'Hello there' });
});

connectionManager.on('message', (data) => {
    console.log('Got message:', data);
});

// World.
new Scene();

// UI.
window.alpine = Alpine;
window.alpine.start();
