'use strict';
import { Request, Response, NextFunction } from 'express';
import cache from '../services/Cache';
import cacheKeyGenerator from '../services/CacheKeyGenerator';
import { runSingleQuery } from '../services/Mysql';
import logger from '../services/Logger';
import { getCookie, clearCookie } from '../utils/cookieUtils';
import { IUserAccountConfig, ISessionData } from '../interfaces/data';

export default async function session(
  req: Request, res: Response, next: NextFunction
): Promise<void | Response> {
  logger.debug({ message: 'Starting session handling' });

  const userAccountConfig = await cache.getObject(
    cacheKeyGenerator.userAccountConfig()
  ) as IUserAccountConfig;

  const token = getCookie({ req, name: userAccountConfig.login.cookieName });

  if (token !== null) {
    const sessionTokenCacheKey = cacheKeyGenerator.sessionTokens({ token });
    const sessionData = await cache.getObject(
      sessionTokenCacheKey
    ) as ISessionData;

    if (Object.getOwnPropertyNames(sessionData).length > 0) {
      const userData = await runSingleQuery({
        query: {
          statement: `SELECT updatedAt FROM users WHERE id=?`,
          bindValues: [ sessionData.userId ],
        },
      }) as { updatedAt: number }[];

      if (
        Object.getOwnPropertyNames(userData).length === 0 ||
        userData[0].updatedAt > sessionData.createdAt
      ) {
        logger.debug({
          message: 'Expiring session due to user not existing or data modified'
        });

        cache.delKey(sessionTokenCacheKey)
        .then(numKeysDeleted => {
          if (numKeysDeleted !== 1) {
            throw Error(`Failed to delete the session token "${token}"`);
          }
          logger.debug({ message: 'Session token deleted from storage' });
        })
        .catch(error => {
          logger.error({
            message: error.message,
            payload: error,
          });
        });

        return(
          clearCookie({ res, name: userAccountConfig.login.cookieName })
          .status(401)
          .json({ error: 'Invalid credentials' })
        );
      } else {
        req.session = { userId: sessionData.userId };

        logger.debug({ message: 'Added session data to Request' });
      }
    } else {
      return(
        clearCookie({ res, name: userAccountConfig.login.cookieName })
        .status(401)
        .json({ error: 'Invalid credentials' })
      );
    }
  }

  next();
}