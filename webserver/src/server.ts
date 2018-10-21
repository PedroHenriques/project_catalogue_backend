'use strict';
import * as express from 'express';
import serverErrorHandler from './middleware/serverErrorHandler';
import logger from './services/Logger';

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'production';
}

const app = express();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info({
    message: `The server is running in "${process.env.NODE_ENV}" mode`
  });
  logger.info({ message: `Listening on localhost:${PORT}` });
});