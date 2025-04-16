import '../styles/main.scss';
import Alpine from 'alpinejs';
import { Scene } from './world/scene';
import { ConnectionManager } from './network/connection-manager';

ConnectionManager.instance.on('open', () => {
    new Scene(() => console.info('Scene is ready.'));
});

ConnectionManager.instance.on('close', () => {
    console.info('Connection closed.');
});

ConnectionManager.instance.on('error', () => {
    console.info('An error ocurred when connecting.');
});

ConnectionManager.instance.connect();
window.alpine = Alpine;
window.alpine.start();
