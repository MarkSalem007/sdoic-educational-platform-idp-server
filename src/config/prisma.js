import { PrismaClient } from '@prisma/client';
import env from './env.js';

const prisma = globalThis.prisma ?? new PrismaClient({
    log:
        env.NODE_ENV === 'development'
            ? ['query', 'warn', 'error']
            : ['error']
});

if (env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;