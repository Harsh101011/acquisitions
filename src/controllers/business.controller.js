import { db } from '#config/database.js';
import { businesses } from '#models/business.model.js';
import { eq } from 'drizzle-orm';
import logger from '#config/logger.js';

export const createBusiness = async (req, res) => {
  try {
    const { title, description, price, location, category } = req.body;
    const ownerId = req.user.id;

    const [newBusiness] = await db
      .insert(businesses)
      .values({
        title,
        description,
        price,
        location,
        category,
        ownerId,
      })
      .returning();

    logger.info(`Business created: ${newBusiness.id} by user ${ownerId}`);
    res.status(201).json(newBusiness);
  } catch (error) {
    logger.error('Error creating business:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to create business',
      });
  }
};

export const getBusinesses = async (req, res) => {
  try {
    const allBusinesses = await db.select().from(businesses);
    res.status(200).json(allBusinesses);
  } catch (error) {
    logger.error('Error fetching businesses:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to fetch businesses',
      });
  }
};

export const getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, Number(id)));

    if (!business) {
      return res
        .status(404)
        .json({ error: 'Not found', message: 'Business not found' });
    }

    res.status(200).json(business);
  } catch (error) {
    logger.error('Error fetching business:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to fetch business',
      });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, location, category } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, Number(id)));

    if (!business) {
      return res
        .status(404)
        .json({ error: 'Not found', message: 'Business not found' });
    }

    if (business.ownerId !== userId && userRole !== 'admin') {
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'You are not authorized to update this business',
        });
    }

    const [updatedBusiness] = await db
      .update(businesses)
      .set({
        title,
        description,
        price,
        location,
        category,
        updated_at: new Date(),
      })
      .where(eq(businesses.id, Number(id)))
      .returning();

    logger.info(`Business updated: ${id} by user ${userId}`);
    res.status(200).json(updatedBusiness);
  } catch (error) {
    logger.error('Error updating business:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to update business',
      });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, Number(id)));

    if (!business) {
      return res
        .status(404)
        .json({ error: 'Not found', message: 'Business not found' });
    }

    if (business.ownerId !== userId && userRole !== 'admin') {
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'You are not authorized to delete this business',
        });
    }

    await db.delete(businesses).where(eq(businesses.id, Number(id)));

    logger.info(`Business deleted: ${id} by user ${userId}`);
    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (error) {
    logger.error('Error deleting business:', error);
    res
      .status(500)
      .json({
        error: 'Internal server error',
        message: 'Failed to delete business',
      });
  }
};
