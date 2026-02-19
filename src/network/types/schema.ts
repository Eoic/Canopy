export interface Player {
    id: string;
    x: number;
    y: number;
    visible: boolean;
    onChange: (callback: () => void) => void;
}

export interface Cell {
    x: number;
    y: number;
    lockedBy: string;
    onChange: (callback: () => void) => void;
}

export interface PlayersMap {
    onAdd: (callback: (player: Player, sessionId: string) => void) => void;
    onRemove: (callback: (player: Player, sessionId: string) => void) => void;
    forEach: (callback: (player: Player, sessionId: string) => void) => void;
}

export interface CellsMap {
    onAdd: (callback: (cell: Cell, sessionId: string) => void) => void;
    onRemove: (callback: (cell: Cell, sessionId: string) => void) => void;
    forEach: (callback: (cell: Cell, sessionId: string) => void) => void;
}

export interface GameState {
    cells: CellsMap;
    players: PlayersMap;
}
