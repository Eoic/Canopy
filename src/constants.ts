// Scene.
// - World size,
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 1000;

// - Zooming.
export const ZOOM = { MIN: 0.25, MAX: 5 };

// - World cell config.
export const CELL_SIZE = 100;
export const CELL_LINE_WIDTH = 2;
export const CELL_FULL_SIZE = CELL_SIZE + CELL_LINE_WIDTH;
export const CELL_HALF_SIZE = CELL_FULL_SIZE / 2;
export const CELL_COLOR = {
    FILL: 0xf0ead2,
    HOVER_FILL: 0xbfd8bd,
    LOCK_FILL: 0xDC143C,
    SELECTION_FILL: 0xb5e48c,
    BORDER: 0xadc178,
};

// User interface.
// - Buttons.
export const BUTTON = {
    HOVER_TINT: 0xCACF85,
    PRESS_TINT: 0xBEB574,
    BACKGROUND_COLOR: 0x2F2F2F,
};
