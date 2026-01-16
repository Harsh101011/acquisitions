import express from 'express';
import * as businessController from '#controllers/business.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';
import { validate } from '#middleware/validate.middleware.js';
import {
  createBusinessSchema,
  updateBusinessSchema,
} from '#validations/business.validation.js';

const router = express.Router();

router.get('/', businessController.getBusinesses);
router.get('/:id', businessController.getBusinessById);

router.post(
  '/',
  authenticateToken,
  validate(createBusinessSchema),
  businessController.createBusiness
);

router.put(
  '/:id',
  authenticateToken,
  validate(updateBusinessSchema),
  businessController.updateBusiness
);

router.delete('/:id', authenticateToken, businessController.deleteBusiness);

export default router;
