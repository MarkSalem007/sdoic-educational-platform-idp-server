import express from 'express';

import routes from './src/config/routes.js';

import cookieParser from 'cookie-parser';

import requestIdMiddleware from './src/middlewares/request-id.middleware.js';
import requestContextMiddleware from './src/middlewares/request-context.middleware.js';
import corsMiddleware from './src/config/cors.js';
import errorMiddleware from './src/middlewares/error.middleware.js';

const app = express();

import env from './src/config/env.js';
app.use('/uploads/profile', express.static(env.STORAGE_LOCATION));
app.use('/uploads/applications', express.static(env.APPLICATION_LOGO_STORAGE));

app.use(express.json());

app.use(corsMiddleware);

app.use(cookieParser());

app.use(requestIdMiddleware);

app.use(requestContextMiddleware);

// Register all routes
routes(app);

// Error handler must always be last
app.use(errorMiddleware);

export default app;