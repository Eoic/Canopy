import { Layer } from '../layers';
import { Assets, Graphics, Sprite, Texture } from 'pixi.js';

type ButtonOptions = {
    icon: string,
    radius: number,
    padding: number,
    position: { x: number, y: number },
};

export class Button extends Graphics {
    constructor(options: ButtonOptions) {
        super();
        this.build(options);
    }

    private build(options: ButtonOptions) {
        this.zIndex = Layer.MenuBG;

        const icon = Assets.get<Texture>([`icon-${options.icon}`]);

        if (!icon)
            throw new Error('Could not load menu icon.');

        const iconGraphics = Sprite.from(icon['0']);
        iconGraphics.position.set(options.position.x, options.position.y);
        iconGraphics.width = options.radius / 2 - options.padding;
        iconGraphics.height = options.radius / 2 - options.padding;

        const bounds = iconGraphics.getLocalBounds();
        iconGraphics.pivot.set((bounds.x + bounds.width) / 2, (bounds.y + bounds.height) / 2);
        iconGraphics.zIndex = Layer.MenuFG;

        this
            .circle(options.position.x, options.position.y, 15)
            .fill({ color: 0x2F2F2F, alpha: 0.85 });

        this.addChild(iconGraphics);

        this.interactive = true;
        this.cursor = 'pointer';
        this.eventMode = 'static';
        this.zIndex = Layer.MenuBG;

        this.addEventListener('pointerup', (event) => {
            event.stopPropagation();
            console.log('Pressing', event.target);
        });

        this.addEventListener('pointerenter', (event) => {
            console.log('On', event.target);
        });

        this.addEventListener('pointerleave', (event) => {
            console.log('Off', event.target);
        });
    }
};
