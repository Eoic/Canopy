import { PointData } from 'pixi.js';

export type UserDTO = {
    id: string;
    isLocal: boolean;
    position: PointData;
};
