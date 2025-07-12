

import { Request, Response, NextFunction } from 'express';
import { CreateOrderRequest } from '../types/order';

export const validateOrderRequest = (
  req: Request<{}, {}, CreateOrderRequest>,
  res: Response,
  next: NextFunction
): void => {
  const { items } = req.body;

  // Check if items exist and is an array
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({
      success: false,
      message: 'Items array is required and cannot be empty'
    });
    return;
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      res.status(400).json({
        success: false,
        message: `Item ${i + 1}: Name is required and cannot be empty`
      });
      return;
    }

    if (!item.size || !['small', 'medium', 'large'].includes(item.size)) {
      res.status(400).json({
        success: false,
        message: `Item ${i + 1}: Size must be 'small', 'medium', or 'large'`
      });
      return;
    }

    if (typeof item.price !== 'number' || item.price <= 0) {
      res.status(400).json({
        success: false,
        message: `Item ${i + 1}: Price must be a positive number`
      });
      return;
    }

    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
      res.status(400).json({
        success: false,
        message: `Item ${i + 1}: Quantity must be a positive number`
      });
      return;
    }
  }

  next();
};
