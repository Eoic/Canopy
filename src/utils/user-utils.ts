import { cyrb53 } from './crypto';

export const USER_COLORS = [
    0xDC143C,
    0x1E555C,
    0x454E9E,
    0x52414C,
    0xD10A81,
    0xB6422B
];

export const getUserColor = (id: string) => {
    return USER_COLORS[cyrb53(id) % USER_COLORS.length];
};
