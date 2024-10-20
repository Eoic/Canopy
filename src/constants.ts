// Scene.
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 1000;
export const ZOOM = { MIN: 0.25, MAX: 5 };
export const CELL_SIZE = 100;
export const CELL_LINE_WIDTH = 2;
export const CELL_FULL_SIZE = CELL_SIZE + CELL_LINE_WIDTH;
export const CELL_HALF_SIZE = CELL_FULL_SIZE / 2;
export const CELL_COLOR = {
    FILL: 0xf0ead2,
    HOVER_FILL: 0xbfd8bd,
    SELECTION_FILL: 0xafa9f9,
    BORDER: 0xadc178,
};

// Network.
export const WEB_SOCKET_URL = 'ws://127.0.0.1:6789';
