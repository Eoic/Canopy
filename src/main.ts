import '../styles/main.scss';
import Alpine from 'alpinejs';
import { Scene } from './world/scene';
import { ConnectionManager } from './network/connection-manager';

new Scene(() => {
    ConnectionManager.instance.connect();
});

// UI.
window.alpine = Alpine;
window.alpine.start();
