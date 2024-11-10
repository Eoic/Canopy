import { Scene } from '../world/scene';

export class UI {
    private _scene: Scene;
    private _actions: Record<string, (event: MouseEvent) => void>;

    constructor(scene: Scene) {
        this._scene = scene;

        this._actions = {
            'home': this._handleHome,
            'zoom-in': this._handleZoomIn,
            'zoom-out': this._handleZoomOut,
        };
    }

    public enable() {
        const buttons = this.getActionButtons();

        buttons.forEach((button) => {
            const buttonElement = button as HTMLButtonElement;

            if (buttonElement.dataset.action)
                buttonElement.addEventListener('click', this._actions[buttonElement.dataset.action]);
        });
    }

    public disable() {
        const buttons = this.getActionButtons();

        buttons.forEach((button) => {
            const buttonElement = button as HTMLButtonElement;

            if (buttonElement.dataset.action)
                buttonElement.removeEventListener('click', this._actions[buttonElement.dataset.action]);
        });
    }

    private getActionButtons(): NodeListOf<Element> {
        const selectors = Object.keys(this._actions).map((action) => `button[data-action="${action}"]`).join(', ');
        return document.querySelectorAll(selectors);
    }

    private _handleHome = (_event: MouseEvent) => {
        this._scene.moveToCell({ x: 0, y: 0 });
    };

    private _handleZoomIn = (_event: MouseEvent) => {
        this._scene.zoomIn();
    };

    private _handleZoomOut = (_event: MouseEvent) => {
        this._scene.zoomOut();
    };
};
