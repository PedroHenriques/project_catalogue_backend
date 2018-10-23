'use strict';
import { Router } from 'express';
import * as cookieParser from 'cookie-parser';
import session from '../middleware/session';
import authenticatedStatus from '../middleware/validateAuthenticatedStatus';
import PropertyHandler from '../handlers/PropertyHandler';

const router = Router();

// Router Middleware
router.use([ cookieParser(), session ]);

const propertyHandler = new PropertyHandler();

router.get('/properties', propertyHandler.findAll);
router.post('/properties', propertyHandler.create);
router.get('/users/properties', propertyHandler.myProperties);

export default router;