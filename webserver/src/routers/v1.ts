'use strict';
import { Router } from 'express';
import PropertyHandler from '../handlers/PropertyHandler';

const router = Router();

const propertyHandler = new PropertyHandler();

router.get('/properties', propertyHandler.findAll);

export default router;