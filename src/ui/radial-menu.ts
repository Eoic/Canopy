import { Layer } from '../world/layers';
import { Button } from './button';
import { Container } from 'pixi.js';
import { CELL_FULL_SIZE } from '../constants';

export type RadialMenuButton = {
    icon: string;
    onClick: VoidFunction;
};

export class RadialMenu extends Container {
    BUTTON_PADDING_RATIO = 0.15;

    constructor(buttons: RadialMenuButton[]) {
        super();
        this.zIndex = Layer.Menu;
        this._build(buttons);
    }

    private _build(buttons: RadialMenuButton[]) {
        const radius = CELL_FULL_SIZE / 2;
        const step = 2 * Math.PI / buttons.length;
        const padding = radius * this.BUTTON_PADDING_RATIO;

        for (let i = 0; i < buttons.length; i++) {
            const position = {
                x: radius * Math.cos(i * step),
                y: radius * Math.sin(i * step),
            };

            const button = new Button({
                radius,
                padding,
                position,
                icon: buttons[i].icon,
                onClick: buttons[i].onClick,
            });

            this.addChild(button);
        }
    }

    public close() {
        this.destroy();
        this.emit('close', {});
    }
};
