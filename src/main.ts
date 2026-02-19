import '../styles/main.scss';
import Alpine from 'alpinejs';
import { Scene } from './world/scene';
import { ColyseusClient } from './network/colyseus-client';

ColyseusClient.instance.connect()
    .catch((error) => console.error('Failed to connect to Colyseus:', error))
    .finally(() => new Scene(() => console.info('Scene is ready.')));

window.alpine = Alpine;
window.alpine.start();
