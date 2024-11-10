import { cyrb53 } from './crypto';

export const USER_COLORS = [0xF00699, 0x018E42, 0x454E9E, 0x52414C, 0xD14081, 0xD66853];

export const getUserColor = (id: string) => {
    const index = cyrb53(id) % USER_COLORS.length;
    console.log(index);
    return USER_COLORS[index];
};
