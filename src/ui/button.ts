import { BUTTON } from '../constants';
import { Layer } from '../world/layers';
import { Assets, Container, FederatedPointerEvent, Graphics, Sprite, Texture } from 'pixi.js';

export type ButtonOptions = {
    icon: string,
    radius: number,
    padding: number,
    onClick: VoidFunction,
    position: { x: number, y: number },
};

export class Button extends Container {
    private _options: ButtonOptions;

    constructor(options: ButtonOptions) {
        super();
        this._options = options;
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

        const buttonGraphics = new Graphics();

        buttonGraphics
            .circle(options.position.x, options.position.y, 15)
            .fill({ color: BUTTON.BACKGROUND_COLOR, alpha: 0.85 });

        this.addChild(buttonGraphics);
        this.addChild(iconGraphics);

        this.interactive = true;
        this.cursor = 'pointer';

        this.addEventListener('pointerup', this._handlePointerUp);
        this.addEventListener('pointerdown', this._handlePointerDown);
        this.addEventListener('pointermove', this._handlePointerMove);
        this.addEventListener('pointerenter', this._handlePointerEnter);
        this.addEventListener('pointerleave', this._handlePointerLeave);
    }

    private _handlePointerMove = (event: FederatedPointerEvent) => {
        event.stopPropagation();
    };

    private _handlePointerEnter = (_event: FederatedPointerEvent) => {
        this.tint = BUTTON.HOVER_TINT;
    };

    private _handlePointerLeave = (_event: FederatedPointerEvent) => {
        this.tint = 0xFFFFFF;
    };

    private _handlePointerDown = (event: FederatedPointerEvent) => {
        event.stopPropagation();

        if (event.button !== 0)
            return;

        this.tint = BUTTON.PRESS_TINT;
        this.scale.set(0.95, 0.95);
    };

    private _handlePointerUp = (event: FederatedPointerEvent) => {
        event.stopPropagation();

        if (event.button !== 0)
            return;

        this.tint = BUTTON.HOVER_TINT;
        this._options.onClick();
        this.scale.set(1, 1);
    };
};
