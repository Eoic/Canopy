import { Schema, MapSchema, type } from '@colyseus/schema';
import { Player } from './Player';
import { Cell } from './Cell';

export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type({ map: Cell }) cells = new MapSchema<Cell>();
}
