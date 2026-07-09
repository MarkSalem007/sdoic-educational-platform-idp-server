export const now = () => new Date();

export const addMinutes = (minutes) =>
    new Date(Date.now() + minutes * 60 * 1000);

export const addHours = (hours) =>
    new Date(Date.now() + hours * 60 * 60 * 1000);

export const addDays = (days) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const isExpired = (date) =>
    new Date(date) <= now();

export const toISOString = (date = now()) =>
    date.toISOString();