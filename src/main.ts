import '../styles/main.scss';
import Alpine from 'alpinejs';
import { Scene } from './world/scene';

new Scene(() => {
    console.info('Scene is ready!');
});

window.alpine = Alpine;
window.alpine.start();
