'use strict';
import { NextFunction, Request, Response } from 'express';
import logger from '../services/Logger';

export default function requestLogger(
  req: Request, res: Response, next: NextFunction
): void {
  logger.info({
    message: `${req.method} ${req.originalUrl} from IP ${req.ip}`,
  });
  logger.debug({
    message: 'The request payload was',
    payload: req.body,
  });

  next();
}