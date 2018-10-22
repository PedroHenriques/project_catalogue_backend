'use strict';
import { Router } from 'express';
import PropertyHandler from '../handlers/PropertyHandler';

const router = Router();

const propertyHandler = new PropertyHandler();

router.get('/properties', propertyHandler.findAll);
router.post('/properties', propertyHandler.create);
router.get('/users/properties', propertyHandler.myProperties);

export default router;