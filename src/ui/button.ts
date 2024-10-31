import { Layer } from '../layers';
import { BUTTON } from '../constants';
import { Assets, Graphics, Sprite, Texture } from 'pixi.js';

export type ButtonOptions = {
    icon: string,
    radius: number,
    padding: number,
    onClick: VoidFunction,
    position: { x: number, y: number },
};

export class Button extends Graphics {
    constructor(options: ButtonOptions) {
        super();
        this._build(options);
    }

    private _build(options: ButtonOptions) {
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
            .fill({ color: BUTTON.BACKGROUND_COLOR, alpha: 0.85 });

        this.addChild(iconGraphics);

        this.interactive = true;
        this.cursor = 'pointer';
        this.eventMode = 'static';
        this.zIndex = Layer.MenuBG;

        this.addEventListener('pointerdown', (event) => {
            event.stopPropagation();

            if (event.button !== 0)
                return;

            this.tint = BUTTON.PRESS_TINT;
        });

        this.addEventListener('pointerup', (event) => {
            event.stopPropagation();

            if (event.button !== 0)
                return;

            this.tint = BUTTON.HOVER_TINT;
            options.onClick();
        });

        this.addEventListener('pointermove', (event) => {
            event.stopPropagation();
        });

        this.addEventListener('pointerenter', (_event) => {
            this.tint = BUTTON.HOVER_TINT;
        });

        this.addEventListener('pointerleave', (_event) => {
            this.tint = 0xFFFFFF;
        });
    }
};
