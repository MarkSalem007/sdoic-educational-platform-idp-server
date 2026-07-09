import app from './app.js';
import env from './src/config/env.js';
import logger from './src/config/logger.js';

app.listen(env.PORT, () => {
    logger.info(
        `Identity Provider running on port ${env.PORT}`
    );
});