import { Layer } from '../layers';
import { CELL_FULL_SIZE, CELL_HALF_SIZE } from '../constants';
import { Graphics, Assets, Container, Texture, Sprite } from 'pixi.js';
import { Button } from './button';

// // // New cell:
// // // 1. Create post.
// // // 3. Copy position.

// // // Existing cell - not owned.
// // // 1. Reply.
// // // 2. Share.
// // // 3. Copy position.

// // // Existing cell - owned.
// // // 1. Edit.
// // // 2. Delete.
// // // 3. Copy position.

type ButtonOptions = {
    icon: string,
    radius: number,
    padding: number,
    position: { x: number, y: number },
};

export class RadialMenu {
    public build(): Container {
        const items = [
            { icon: 'circle-minus' },
            { icon: 'circle-plus' },
            { icon: 'map-location-dot' },
            { icon: 'pen' },
            { icon: 'reply' },
            { icon: 'thumbtack-slash' },
            { icon: 'thumbtack' }
        ];

        const menu = new Container({ zIndex: Layer.Menu });
        const radius = CELL_FULL_SIZE / 2;
        const center = { x: 0, y: 0 };
        const step = 2 * Math.PI / items.length;
        const padding = radius * 0.15;

        for (let i = 0; i < items.length; i++) {
            const position = {
                x: center.x + radius * Math.cos(i * step),
                y: center.y + radius * Math.sin(i * step),
            };

            const button = new Button({ icon: items[i].icon, position, radius, padding });
            menu.addChild(button);
        }

        return menu;
    }
};
