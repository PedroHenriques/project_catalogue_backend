'use strict';
import { Router } from 'express';
import * as cookieParser from 'cookie-parser';
import session from '../middleware/session';
import authenticatedStatus from '../middleware/validateAuthenticatedStatus';
import PropertyHandler from '../handlers/PropertyHandler';
import UserHandler from '../handlers/UserHandler';

const router = Router();

// Router Middleware
router.use([ cookieParser(), session ]);

const propertyHandler = new PropertyHandler();
const userHandler = new UserHandler();

router.get('/properties', propertyHandler.findAll);
router.post(
  '/properties',
  [ authenticatedStatus('notLoggedIn'),  propertyHandler.create ]
);
router.get(
  '/users/properties',
  [ authenticatedStatus('notLoggedIn'), propertyHandler.myProperties ]
);

router.post(
  '/users',
  [ authenticatedStatus('loggedIn'), userHandler.create ]
);
router.post(
  '/login',
  [ authenticatedStatus('loggedIn'), userHandler.login ]
);
router.get(
  '/logout',
  [ authenticatedStatus('notLoggedIn'), userHandler.logout]
);
router.post(
  '/users/activate',
  [ authenticatedStatus('loggedIn'), userHandler.activate ]
);
router.post(
  '/users/lostPw',
  [ authenticatedStatus('loggedIn'), userHandler.lostPassword ]
);
router.post(
  '/users/pwReset',
  [ authenticatedStatus('loggedIn'), userHandler.passwordReset ]
);

export default router;