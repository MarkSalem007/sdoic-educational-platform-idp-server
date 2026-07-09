import crypto from 'crypto';
import { hashPassword, comparePassword } from '../utils/password.js';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*';

const ALL =
    LOWERCASE +
    UPPERCASE +
    NUMBERS +
    SPECIAL;

const randomCharacter = (characters) =>
    characters[
        crypto.randomInt(0, characters.length)
    ];

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
};

export const generateTemporaryPassword = (length = 12) => {
    if (length < 8) {
        throw new Error('Password length must be at least 8.');
    }
    const password = [
        randomCharacter(LOWERCASE),
        randomCharacter(UPPERCASE),
        randomCharacter(NUMBERS),
        randomCharacter(SPECIAL)
    ];
    while (password.length < length) {
        password.push(
            randomCharacter(ALL)
        );
    }
    return shuffle(password);
};

export const hash = hashPassword;

export const compare = comparePassword;