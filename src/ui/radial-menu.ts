// // // New cell:
// // // 1. Create post.
// // // 3. Copy position.

import { Application, Graphics, Assets, GraphicsContext, Sprite } from 'pixi.js';
import { Vector } from '../math/vector';
import { CELL_HALF_SIZE, CELL_LINE_WIDTH } from '../constants';
import { Layers } from '../layers';
import { Viewport } from 'pixi-viewport';

// // // Existing cell - not owned.
// // // 1. Reply.
// // // 2. Share.
// // // 3. Copy position.

// // // Existing cell - owned.
// // // 1. Edit.
// // // 2. Delete.
// // // 3. Copy position.

export type RadialMenuItem = {
    color: string;
};

export class RadialMenu {
    // private _items: RadialMenuItem[] = [];

    // constructor(items: RadialMenuItem[]) {
    //     this._items = items;
    // }

    public static build(): Graphics {
        const items = [
            { icon: 'reply' },
            // { icon: 'circle-plus' },
            // { icon: 'thumbtrack' },
            // { icon: 'map-location-dot' }
        ];


        const graphics = new Graphics();

        graphics
            .ellipse(0, 0, CELL_HALF_SIZE - CELL_LINE_WIDTH, CELL_HALF_SIZE - CELL_LINE_WIDTH)
            .fill({ color: 0xAA4F08, alpha: 0.15 });

        const radius = (CELL_HALF_SIZE - CELL_LINE_WIDTH);
        const center = { x: 0, y: 0 };
        const step = 2 * Math.PI / items.length;
        const padding = radius * 0.1;

        for (let i = 0; i < items.length; i++) {
            const position = {
                x: center.x + radius * Math.cos(i * step),
                y: center.y + radius * Math.sin(i * step),
            };

            const icon = Assets.get<GraphicsContext>([`icon-${items[i].icon}`]);

            if (!icon)
                throw new Error('Could not load menu icon.');

            const iconGraphics = new Graphics(icon['0']);
            iconGraphics.position.set(position.x, position.y);
            iconGraphics.scale.set(1, 1);
            iconGraphics.width = radius / 2 - padding;
            iconGraphics.height = radius / 2 - padding;

            const bounds = iconGraphics.getLocalBounds();

            iconGraphics.pivot.set((bounds.x + bounds.width) / 2, (bounds.y + bounds.height) / 2);

            // iconGraphics.pivot.x = ico
            iconGraphics.zIndex = Layers.MenuFG;
            graphics.addChild(iconGraphics);

            graphics
                .circle(position.x, position.y, 15)
                .fill({ color: 0x2F2F2F, alpha: 0.85 });

            graphics.zIndex = Layers.MenuBG;

            graphics.cursor = 'pointer';
            graphics.interactive = true;
            graphics.eventMode = 'static';
            graphics.on('click', (event) => console.log(event));
        }

        return graphics;
    }
};
