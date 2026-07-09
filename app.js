import express from 'express';

import routes from './src/config/routes.js';

import requestIdMiddleware from './src/middlewares/request-id.middleware.js';
import requestContextMiddleware from './src/middlewares/request-context.middleware.js';
import errorMiddleware from './src/middlewares/error.middleware.js';

const app = express();

app.use(express.json());

app.use(requestIdMiddleware);

app.use(requestContextMiddleware);

// Register all routes
routes(app);

// Error handler must always be last
app.use(errorMiddleware);

export default app;