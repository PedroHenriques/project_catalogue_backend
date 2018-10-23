'use strict';
import * as express from 'express';
import { join } from 'path';
import requestLogger from './middleware/requestLogger';
import validateCORS from './middleware/validateCORS';
import serverErrorHandler from './middleware/serverErrorHandler';
import v1Router from './routers/v1';
import logger from './services/Logger';
import FileLoader from './services/FileLoader';
import cacheKeyGenerator from './services/CacheKeyGenerator';

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'production';
}

const fileLoader = new FileLoader({
  filesToWatch: {
    userAccountConfig: {
      path: join('.', 'config', 'userAccountConfig.json'),
      lastModified: -1,
      persistKey: cacheKeyGenerator.userAccountConfig(),
    },
  },
});

const app = express();

// General Middleware
app.use([ express.json(), requestLogger, validateCORS ]);

// Routers
app.use('/api/v1', v1Router);

// General Error Handling Middleware
app.use([ serverErrorHandler ]);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info({
    message: `The server is running in "${process.env.NODE_ENV}" mode`
  });
  logger.info({ message: `Listening on localhost:${PORT}` });
});