'use strict';
import { NextFunction, Request, Response } from 'express';
import logger from '../services/Logger';

export default function validateAuthenticatedStatus(
  denyAccessIf: 'loggedIn' | 'notLoggedIn'
) {
  return(
    async (
      req: Request, res: Response, next: NextFunction
    ): Promise<void | Response> => {
      logger.debug({ message: 'Starting logged in verification' });

      const isLoggedIn: boolean = req.session !== undefined;
      if (isLoggedIn && denyAccessIf === 'loggedIn') {
        logger.debug({ message: 'Denied because is logged in' });

        return(res.status(403).json({
          error: 'The request is only valid for non authenticated users',
        }));
      }
      if (!isLoggedIn && denyAccessIf === 'notLoggedIn') {
        logger.debug({ message: 'Denied because is not logged in' });

        return(res.status(401).json({
          error: 'Invalid credentials',
        }));
      }

      logger.debug({ message: 'Logged in status valid' });

      next();
    }
  );
}