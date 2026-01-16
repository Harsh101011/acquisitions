import { db } from '#config/database.js';
import { deals } from '#models/deal.model.js';
import { businesses } from '#models/business.model.js';
import { eq } from 'drizzle-orm';
import logger from '#config/logger.js';

export const createDeal = async (req, res) => {
  try {
    const { businessId, offerAmount, message } = req.body;
    const buyerId = req.user.id;

    // Check if business exists
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId));
    if (!business) {
      return res
        .status(404)
        .json({ error: 'Not found', message: 'Business not found' });
    }

    // specific rule: Owner cannot buy their own business
    if (business.ownerId === buyerId) {
      return res
        .status(400)
        .json({
          error: 'Bad Request',
          message: 'Cannot buy your own business',
        });
    }

    const [newDeal] = await db
      .insert(deals)
      .values({
        businessId,
        buyerId,
        offerAmount,
        message,
        status: 'pending',
      })
      .returning();

    logger.info(
      `Deal created: ${newDeal.id} by user ${buyerId} for business ${businessId}`
    );
    res.status(201).json(newDeal);
  } catch (error) {
    logger.error('Error creating deal:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to create deal',
      });
  }
};

export const getDealsForBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    // Verify ownership or admin
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, Number(businessId)));

    if (!business) {
      return res
        .status(404)
        .json({ error: 'Not found', message: 'Business not found' });
    }

    if (business.ownerId !== userId && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Not authorized to view deals for this business',
        });
    }

    const businessDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.businessId, Number(businessId)));
    res.status(200).json(businessDeals);
  } catch (error) {
    logger.error('Error fetching deals:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to fetch deals',
      });
  }
};

export const getMyDeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const myDeals = await db
      .select()
      .from(deals)
      .where(eq(deals.buyerId, userId));
    res.status(200).json(myDeals);
  } catch (error) {
    logger.error('Error fetching my deals:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to fetch deals',
      });
  }
};

export const updateDealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, Number(id)));

    if (!deal) {
      return res
        .status(404)
        .json({ error: 'Not found', message: 'Deal not found' });
    }

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, deal.businessId));

    // Only business owner can accept/reject. Buyer can cancel if pending.
    const isOwner = business.ownerId === userId;
    const isBuyer = deal.buyerId === userId;

    if (!isOwner && !isBuyer && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Not authorized' });
    }

    // Logic for state transitions could be more complex, simplification here
    if (isBuyer && status === 'cancelled') {
      if (deal.status !== 'pending') {
        return res
          .status(400)
          .json({
            error: 'Bad Request',
            message: 'Can only cancel pending deals',
          });
      }
    } else if (isOwner && (status === 'accepted' || status === 'rejected')) {
      // Owner accepting/rejecting
    } else if (req.user.role === 'admin') {
      // Admin can do anything
    } else {
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Invalid status change for your role',
        });
    }

    const [updatedDeal] = await db
      .update(deals)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(deals.id, Number(id)))
      .returning();

    logger.info(`Deal ${id} status updated to ${status} by user ${userId}`);
    res.status(200).json(updatedDeal);
  } catch (error) {
    logger.error('Error updating deal:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to update deal',
      });
  }
};
