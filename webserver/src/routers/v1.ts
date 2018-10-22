'use strict';
import { Router } from 'express';
import PropertyHandler from '../handlers/PropertyHandler';

const router = Router();

const propertyHandler = new PropertyHandler();

export default router;