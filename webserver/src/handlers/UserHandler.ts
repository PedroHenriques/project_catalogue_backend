'use strict';
import { Response, Request } from 'express';
import cache from '../services/Cache';
import cacheKeyGenerator from '../services/CacheKeyGenerator';
import { runSingleQuery } from '../services/Mysql';
import logger from '../services/Logger';
import mailer from '../services/Mailer';
import { generateToken } from '../utils/tokenUtils';
import { clearCookie, setCookie } from '../utils/cookieUtils';
import { createHash, matchHash } from '../utils/passwordUtils';
import {
  IUserAccountConfig, IUsersPendingActivation, IUserTableRow,
  IPasswordsPendingReset, ISessionData
} from '../interfaces/data';
import { IEmailBodyReplacement } from '../interfaces/services';

export default class UserHandler {
  public logout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userAccountConfig = await cache.getObject(
        cacheKeyGenerator.userAccountConfig()
      ) as IUserAccountConfig;

      return(
        clearCookie({ res, name: userAccountConfig.login.cookieName })
        .status(200)
        .json({})
      );
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }

  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      let email = req.body.email;
      if (email === undefined) {
        return(res.status(400).json({
          error: 'The "email" property is missing from the request payload.',
        }));
      }
      if (typeof email !== 'string') {
        return(res.status(400).json({
          error: 'The provided email must be a string and not a ' +
            `"${typeof email}".`,
        }));
      }
      email = email.trim();
      if (email.length === 0) {
        return(res.status(400).json({
          error: 'The provided email was an empty string.',
        }));
      }

      const password = req.body.password;
      if (password === undefined) {
        return(res.status(400).json({
          error: 'The "password" property is missing from the request payload.',
        }));
      }
      if (typeof password !== 'string') {
        return(res.status(400).json({
          error: 'The provided password must be a string and not a ' +
            `"${typeof password}".`,
        }));
      }
      if (password.length === 0) {
        return(res.status(400).json({
          error: 'The provided password was an empty string.',
        }));
      }

      const userData = await runSingleQuery({
        query: {
          statement: 'SELECT * FROM users WHERE email=?',
          bindValues: [ email ],
        },
      }) as IUserTableRow[];

      if (
        Object.getOwnPropertyNames(userData).length === 0 ||
        userData[0].id === undefined ||
        ! await matchHash(password, userData[0].password)
      ) {
        return(res.status(401).json({
          error: 'The provided credentials are not valid.',
        }));
      }

      logger.debug({ message: 'Generating session token' });

      const sessionToken = generateToken();
      const sessionTokenPersistKey = cacheKeyGenerator.sessionTokens({
        token: sessionToken
      });

      logger.debug({ message: 'Storing session token in persist layer' });

      const sessionData: ISessionData = {
        userId: `${userData[0].id}`,
        createdAt: Date.now(),
      };

      if (! await cache.setObjectIfNotExists(
        sessionTokenPersistKey, sessionData
      )) {
        throw Error(
          `Failed to store the session token for the email "${email}"`
        );
      }

      const userAccountConfig = await cache.getObject(
        cacheKeyGenerator.userAccountConfig()
      ) as IUserAccountConfig;

      logger.debug({ message: 'Setting expire to session token' });

      cache.expireKey(
        sessionTokenPersistKey,
        userAccountConfig.login.sessionDurationInSeconds
      )
      .then(success => {
        if (!success) {
          throw Error(
            'Failed to set expiration of the session token for the email ' +
            `${email}`
          );
        }
        logger.debug({ message: 'Session token is set to expire' });
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });

      return(
        setCookie({
          res,
          name: userAccountConfig.login.cookieName,
          value: sessionToken,
        })
        .status(200)
        .json({})
      );
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      let email = req.body.email;
      if (email === undefined) {
        return(res.status(400).json({
          error: 'The "email" property is missing from the request payload.',
        }));
      }
      if (typeof email !== 'string') {
        return(res.status(400).json({
          error: 'The provided email must be a string and not a ' +
            `"${typeof email}".`,
        }));
      }
      email = email.trim();
      if (email.length === 0) {
        return(res.status(400).json({
          error: 'The provided email was an empty string.',
        }));
      }

      const password = req.body.password;
      if (password === undefined) {
        return(res.status(400).json({
          error: 'The "password" property is missing from the request payload.',
        }));
      }
      if (typeof password !== 'string') {
        return(res.status(400).json({
          error: 'The provided password must be a string and not a ' +
            `"${typeof password}".`,
        }));
      }
      if (password.length === 0) {
        return(res.status(400).json({
          error: 'The provided password was an empty string.',
        }));
      }

      const name = req.body.name;
      if (name === undefined) {
        return(res.status(400).json({
          error: 'The "name" property is missing from the request payload.',
        }));
      }
      if (typeof name !== 'string') {
        return(res.status(400).json({
          error: 'The provided name must be a string and not a ' +
            `"${typeof name}".`,
        }));
      }
      if (name.length === 0) {
        return(res.status(400).json({
          error: 'The provided name was an empty string.',
        }));
      }

      const emailCount = await runSingleQuery({
        query: {
          statement: 'SELECT count(id) as count FROM users WHERE email=?',
          bindValues: [ email ],
        },
      }) as { count: number }[];

      if (emailCount.length === 0 || emailCount[0].count > 0) {
        return(res.status(400).json({
          error: 'The provided email is not valid.',
        }));
      }

      const userManagerConfig = await cache.getObject(
        cacheKeyGenerator.userAccountConfig()
      ) as IUserAccountConfig;

      const token = generateToken();
      const pwHash = await createHash(password);
      await this.storePendingActivationUser({
        email, token, pwHash, name,
        expire: userManagerConfig.accountRegistration.tokenDurationInSeconds,
      });

      this.getDomainUrl()
      .then(domainUrl => {
        const emailBodyReplacements: IEmailBodyReplacement[] = [
          {
            find: '\\|\\!ACTIVATION_URL\\!\\|',
            replace: domainUrl +
              userManagerConfig.accountRegistration.activationRelUrl +
              `?email=${encodeURI(email)}&token=${encodeURI(token)}`,
          },
        ];

        return(mailer.send({
          ...userManagerConfig.accountRegistration.email,
          to: email,
          body: {
            ...userManagerConfig.accountRegistration.email.body,
            keywordReplacements: emailBodyReplacements,
          },
        }));
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });

      return(res.status(201).json({}));
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }

  public activate = async (req: Request, res: Response): Promise<Response> => {
    try {
      let email = req.body.email;
      if (email === undefined) {
        return(res.status(400).json({
          error: 'The "email" property is missing from the request payload.',
        }));
      }
      if (typeof email !== 'string') {
        return(res.status(400).json({
          error: 'The provided email must be a string and not a ' +
            `"${typeof email}".`,
        }));
      }
      email = email.trim();
      if (email.length === 0) {
        return(res.status(400).json({
          error: 'The provided email was an empty string.',
        }));
      }

      let token = req.body.token;
      if (token === undefined) {
        return(res.status(400).json({
          error: 'The "token" property is missing from the request payload.',
        }));
      }
      if (typeof token !== 'string') {
        return(res.status(400).json({
          error: 'The provided token must be a string and not a ' +
            `"${typeof token}".`,
        }));
      }
      token = token.trim();
      if (token.length === 0) {
        return(res.status(400).json({
          error: 'The provided token was an empty string.',
        }));
      }

      const userActivationKey = cacheKeyGenerator
        .usersPendingActivation({ email });

      const userActivationData = await cache.getObject(
        userActivationKey
      ) as IUsersPendingActivation;

      if (
        Object.getOwnPropertyNames(userActivationData).length === 0 ||
        userActivationData.token !== token
      ) {
        return(res.status(400).json({
          error: 'The provided email and token pair is not valid.',
        }));
      }

      const userData: IUserTableRow = {
        email,
        name: userActivationData.name,
        password: userActivationData.pwHash,
      };

      if (! await runSingleQuery({
        query: {
          statement: 'INSERT INTO users SET ?',
          bindValues: [ userData ],
        },
      })) {
        throw Error(
          'Failed to store the user data after account activation for the ' +
          `email address ${email}`
        );
      }

      cache.delKey(userActivationKey)
      .then(numDeletedKeys => {
        if (numDeletedKeys !== 1) {
          throw Error(
            'Failed to delete the user pending activation data for the ' +
            `email address ${email}`
          );
        }
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });

      Promise.all([
        cache.getObject(
          cacheKeyGenerator.userAccountConfig()
        ) as Promise<IUserAccountConfig>,
        this.getDomainUrl(),
      ])
      .then(promiseValues => {
        const [userAccountConfig, domainUrl] = promiseValues;

        const emailBodyReplacements: IEmailBodyReplacement[] = [
          {
            find: '\\|\\!LOGIN_URL\\!\\|',
            replace: domainUrl +
              userAccountConfig.accountActivation.loginRelUrl,
          },
        ];

        return(mailer.send({
          ...userAccountConfig.accountActivation.email,
          to: email,
          body: {
            ...userAccountConfig.accountActivation.email.body,
            keywordReplacements: emailBodyReplacements,
          },
        }));
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });

      return(res.status(200).json({}));
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }

  public lostPassword = async (
    req: Request, res: Response
  ): Promise<Response> => {
    try {
      let email = req.body.email;
      if (email === undefined) {
        return(res.status(400).json({
          error: 'The "email" property is missing from the request payload.',
        }));
      }
      if (typeof email !== 'string') {
        return(res.status(400).json({
          error: 'The provided email must be a string and not a ' +
            `"${typeof email}".`,
        }));
      }
      email = email.trim();
      if (email.length === 0) {
        return(res.status(400).json({
          error: 'The provided email was an empty string.',
        }));
      }

      const emailCount = await runSingleQuery({
        query: {
          statement: 'SELECT count(id) as count FROM users WHERE email=?',
          bindValues: [ email ],
        },
      }) as { count: number }[];

      if (emailCount.length === 0 || emailCount[0].count > 0) {
        (cache.getObject(
          cacheKeyGenerator.userAccountConfig()
        ) as Promise<IUserAccountConfig>)
        .then(async (userAccountConfig) => {
          try {
            const token = generateToken();
            await this.storePendingPasswordReset({
              email, token,
              expire: userAccountConfig.lostPassword.tokenDurationInSeconds,
            });

            const emailBodyReplacements: IEmailBodyReplacement[] = [
              {
                find: '\\|\\!PW_RESET_URL\\!\\|',
                replace: await this.getDomainUrl() +
                  userAccountConfig.lostPassword.pwResetRelUrl +
                  `?email=${encodeURI(email)}&token=${encodeURI(token)}`,
              },
            ];

            await mailer.send({
              ...userAccountConfig.lostPassword.email,
              to: email,
              body: {
                ...userAccountConfig.lostPassword.email.body,
                keywordReplacements: emailBodyReplacements,
              },
            });
          } catch (error) {
            logger.error({
              message: error.message,
              payload: error,
            });
          }
        })
        .catch(error => {
          logger.error({
            message: error.message,
            payload: error,
          });
        });
      }

      // Don't give away the information of whether an account exists
      // for an email address or not
      return(res.status(200).json({}));
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }

  public passwordReset = async (
    req: Request, res: Response
  ): Promise<Response> => {
    try {
      let email = req.body.email;
      if (email === undefined) {
        return(res.status(400).json({
          error: 'The "email" property is missing from the request payload.',
        }));
      }
      if (typeof email !== 'string') {
        return(res.status(400).json({
          error: 'The provided email must be a string and not a ' +
            `"${typeof email}".`,
        }));
      }
      email = email.trim();
      if (email.length === 0) {
        return(res.status(400).json({
          error: 'The provided email was an empty string.',
        }));
      }

      let token = req.body.token;
      if (token === undefined) {
        return(res.status(400).json({
          error: 'The "token" property is missing from the request payload.',
        }));
      }
      if (typeof token !== 'string') {
        return(res.status(400).json({
          error: 'The provided token must be a string and not a ' +
            `"${typeof token}".`,
        }));
      }
      token = token.trim();
      if (token.length === 0) {
        return(res.status(400).json({
          error: 'The provided token was an empty string.',
        }));
      }

      const newPassword = req.body.password;
      if (newPassword === undefined) {
        return(res.status(400).json({
          error: 'The "password" property is missing from the request payload.',
        }));
      }
      if (typeof newPassword !== 'string') {
        return(res.status(400).json({
          error: 'The provided password must be a string and not a ' +
            `"${typeof newPassword}".`,
        }));
      }
      if (newPassword.length === 0) {
        return(res.status(400).json({
          error: 'The provided password was an empty string.',
        }));
      }

      const pwResetKey = cacheKeyGenerator
        .passwordsPendingReset({ email });

      const pwResetData = await cache.getObject(
        pwResetKey
      ) as IPasswordsPendingReset;

      if (
        Object.getOwnPropertyNames(pwResetData).length === 0 ||
        pwResetData.token !== token
      ) {
        return(res.status(400).json({
          error: 'The provided email and token pair is not valid.',
        }));
      }

      const insertResult = await runSingleQuery({
        query: {
          statement: 'UPDATE users SET password=? WHERE email=?',
          bindValues: [ await createHash(newPassword), email ],
        },
      });

      if (insertResult.affectedRows && insertResult.affectedRows === 0) {
        throw Error(
          'Failed to store the updated user data during password reset for ' +
          `the email address ${email}`
        );
      }

      cache.delKey(pwResetKey)
      .then(numDeletedKeys => {
        if (numDeletedKeys !== 1) {
          throw Error(
            'Failed to delete the password pending reset data for the ' +
            `email address ${email}`
          );
        }
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });

      (cache.getObject(
        cacheKeyGenerator.userAccountConfig()
      ) as Promise<IUserAccountConfig>)
      .then(userAccountConfig => mailer.send({
        ...userAccountConfig.resetPassword.email,
        to: email,
        body: {
          ...userAccountConfig.resetPassword.email.body,
          keywordReplacements: [],
        },
      }))
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });

      return(res.status(200).json({}));
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(res.status(500).json({
        error: 'Could not handle the request.',
      }));
    }
  }

  private storePendingActivationUser = (
    args: {
      email: string, token: string, expire: number, pwHash: string, name: string
    }
  ): Promise<void> => {
    const persistKey = cacheKeyGenerator.usersPendingActivation({
      email: args.email,
    });

    const data: IUsersPendingActivation = {
      token: args.token,
      pwHash: args.pwHash,
      name: args.name,
    };

    return(
      cache.setObject(persistKey, data)
      .then(result => {
        if (!result) {
          throw Error(
            `Could not store the activation token for the email "${args.email}"`
          );
        }
      })
      .then(() => cache.expireKey(persistKey, args.expire))
      .then(result => {
        if (!result) {
          throw Error(
            'Could set the expiration timer on the activation token for the ' +
            `email "${args.email}"`
          );
        }
      })
    );
  }

  private storePendingPasswordReset = (
    args: { email: string, token: string, expire: number }
  ): Promise<void> => {
    const persistKey = cacheKeyGenerator.passwordsPendingReset({
      email: args.email,
    });

    return(
      cache.setObject(
        persistKey,
        { token: args.token }
      )
      .then(result => {
        if (!result) {
          throw Error(
            `Could not store the pw reset token for the email "${args.email}"`
          );
        }
      })
      .then(() => cache.expireKey(persistKey, args.expire))
      .then(result => {
        if (!result) {
          throw Error(
            'Could set the expiration timer on the pw reset token for the ' +
            `email "${args.email}"`
          );
        }
      })
    );
  }

  private async getDomainUrl(): Promise<string> {
    try {
      const userAccountConfig = await cache.getObject(
        cacheKeyGenerator.userAccountConfig()
      ) as IUserAccountConfig;

      const siteUrl = userAccountConfig
        .domain[`${process.env.DEPLOY_STAGE}RootUrl`];

      if (siteUrl === undefined) {
        throw Error(
          `Could not find the "${process.env.DEPLOY_STAGE}RootUrl" property ` +
          'in the userManager.json "domain" section.'
        );
      }

      return(siteUrl);
    } catch (error) {
      logger.error({
        message: error.message,
        payload: error,
      });

      return(Promise.reject(error.message));
    }
  }
}