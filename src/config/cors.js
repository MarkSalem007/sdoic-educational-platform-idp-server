import cors from 'cors';
import env from './env.js';

const allowedOrigins = env.ALLOWED_ORIGINS
    .split(',')
    .map(origin => origin.trim());

export default cors({

    origin(origin, callback) {

        // Allow Postman/mobile apps (no Origin header)
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error(`Origin ${origin} is not allowed by CORS.`)
        );

    },

    credentials: true,

    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
    ],

    allowedHeaders: [
        'Authorization',
        'Content-Type',
        'X-Request-ID',
        'Idempotency-Key'
    ]

});