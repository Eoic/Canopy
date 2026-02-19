import { Schema, type } from '@colyseus/schema';

export class Cell extends Schema {
    @type('number') x: number = 0;
    @type('number') y: number = 0;
    @type('string') lockedBy: string = '';
}
