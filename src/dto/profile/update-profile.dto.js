import { z } from 'zod';

const schema = z.object({

    firstName:
        z.string().trim().min(1).optional(),

    middleName:
        z.string().trim().optional(),

    lastName:
        z.string().trim().min(1).optional(),

    suffix:
        z.string().trim().optional(),

    mobileNumber:
        z.preprocess(
            (val) => {
                if (val === undefined) return undefined;
                if (val === null) return null;
                if (typeof val === 'string') {
                    const trimmed = val.trim();
                    return trimmed === '' ? null : trimmed;
                }
                return val;
            },
            z.string().regex(/^09\d{9}$/, 'Invalid Philippine mobile number.').nullable().optional()
        ),

    employeeId:
        z.string().trim().optional(),

    plantilla:
        z.string().trim().optional(),

    plantillaStatus:
        z.enum([
            'PERMANENT',
            'CONTRACTUAL',
            'COS',
            'JO',
            'SUBSTITUTE',
            'PROVISIONAL',
            'NATIONAL',
            'CASUAL'
        ]).optional(),

    officeId:
        z.string().uuid().nullable().optional(),

    institutionId:
        z.string().uuid().nullable().optional()

}).strict();

export const validateUpdateProfile = (data) =>
    schema.parse(data);