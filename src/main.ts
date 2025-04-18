import '../styles/main.scss';
import Alpine from 'alpinejs';
import { Scene } from './world/scene';
import { ConnectionManager } from './network/connection-manager';

const scene = new Scene(() => {
    console.info('Scene is ready.');
    console.info('Connecting to the server...');
    
    ConnectionManager.instance.on('close', () => {
        console.info('Connection closed.');
    });

    ConnectionManager.instance.on('error', () => {
        console.info('An error ocurred when connecting.');
    });

    ConnectionManager.instance.connect();
});

window.alpine = Alpine;
window.alpine.start();
