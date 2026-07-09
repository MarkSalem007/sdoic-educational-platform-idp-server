import { z } from 'zod';

export const optionalText = (maxLength) =>
    z.preprocess(
        (value) => {
            if (value === undefined || value === null) {
                return null;
            }
            if (typeof value !== 'string') {
                return value;
            }
            const trimmed = value.trim();
            return trimmed === '' ? null : trimmed;
        },
        z.string().max(maxLength, `Must not exceed ${maxLength} characters.`).nullable()
    );

export const requiredText = (field, maxLength) =>
    z.preprocess(
        (value) => {
            if (value === undefined || value === null) {
                return '';
            }
            return value;
        },
        z.string()
            .trim()
            .min(1, `${field} is required.`)
            .max(maxLength, `${field} must not exceed ${maxLength} characters.`)
    );

export const email =
    z.preprocess(
        (value) => {
            if (value === undefined || value === null) {
                return '';
            }
            return value;
        },
        z.string()
            .trim()
            .min(1, 'Email is required.')
            .email('Invalid email address.')
            .max(255, `Email must not exceed 255 characters.`)
    );

export const uuid = z
    .string()
    .uuid('Invalid UUID.');