import { addMinutes, addHours, addDays } from './date.js';

export const durationToDate = (duration) => {
    if (typeof duration !== 'string') {
        throw new Error('Duration must be a string.');
    }
    const match = duration.trim().match(/^(\d+)([mhd])$/i);
    if (!match) {
        throw new Error(`Invalid duration: ${duration}`);
    }
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 'm':
            return addMinutes(value);
        case 'h':
            return addHours(value);
        case 'd':
            return addDays(value);
        default:
            throw new Error(
                `Unsupported duration unit: ${unit}`
            );
    }
};