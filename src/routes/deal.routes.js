import express from 'express';
import * as dealController from '#controllers/deal.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';
import { validate } from '#middleware/validate.middleware.js';
import {
  createDealSchema,
  updateDealStatusSchema,
} from '#validations/deal.validation.js';

const router = express.Router();

// Create a new deal (offer)
router.post(
  '/',
  authenticateToken,
  validate(createDealSchema),
  dealController.createDeal
);

// Get deals made by the current user (as buyer)
router.get('/my-deals', authenticateToken, dealController.getMyDeals);

// Get deals for a specific business (as owner)
router.get(
  '/business/:businessId',
  authenticateToken,
  dealController.getDealsForBusiness
);

// Update deal status (accept/reject/cancel)
router.patch(
  '/:id/status',
  authenticateToken,
  validate(updateDealStatusSchema),
  dealController.updateDealStatus
);

export default router;
