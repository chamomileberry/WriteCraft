import { Router } from "express";
import { discountCodeService } from "../services/discountCodeService";
import { secureAuthentication, requireAdmin } from "../security/middleware";
import { insertDiscountCodeSchema } from "@shared/schema";
import { z } from "zod";
import { readRateLimiter, writeRateLimiter, billingRateLimiter } from "../security/rateLimiters";

export const discountCodeRouter = Router();

// ==================== ADMIN ROUTES ====================

/**
 * Create discount code (admin only)
 */
discountCodeRouter.post(
  "/admin/create",
  secureAuthentication,
  requireAdmin,
  writeRateLimiter,
  async (req: any, res, next) => {
    try {
      const validatedData = insertDiscountCodeSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });

      const code = await discountCodeService.createDiscountCode(validatedData);

      res.json({
        success: true,
        code,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get all discount codes (admin only)
 */
discountCodeRouter.get(
  "/admin/all",
  secureAuthentication,
  requireAdmin,
  readRateLimiter,
  async (req: any, res, next) => {
    try {
      const codes = await discountCodeService.getAllDiscountCodes();

      res.json({
        success: true,
        codes,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get discount code by ID (admin only)
 */
discountCodeRouter.get(
  "/admin/:id",
  secureAuthentication,
  requireAdmin,
  readRateLimiter,
  async (req: any, res, next) => {
    try {
      const code = await discountCodeService.getDiscountCodeById(req.params.id);

      if (!code) {
        return res.status(404).json({
          success: false,
          error: 'Discount code not found',
        });
      }

      res.json({
        success: true,
        code,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update discount code (admin only)
 */
discountCodeRouter.patch(
  "/admin/:id",
  secureAuthentication,
  requireAdmin,
  writeRateLimiter,
  async (req: any, res, next) => {
    try {
      const updates = req.body;
      const code = await discountCodeService.updateDiscountCode(
        req.params.id,
        updates
      );

      res.json({
        success: true,
        code,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Delete discount code (admin only)
 */
discountCodeRouter.delete(
  "/admin/:id",
  secureAuthentication,
  requireAdmin,
  writeRateLimiter,
  async (req: any, res, next) => {
    try {
      await discountCodeService.deleteDiscountCode(req.params.id);

      res.json({
        success: true,
        message: 'Discount code deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get discount code usage statistics (admin only)
 */
discountCodeRouter.get(
  "/admin/:id/stats",
  secureAuthentication,
  requireAdmin,
  readRateLimiter,
  async (req: any, res, next) => {
    try {
      const stats = await discountCodeService.getCodeUsageStats(req.params.id);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== PUBLIC ROUTES ====================

/**
 * Validate discount code
 */
discountCodeRouter.post(
  "/validate",
  secureAuthentication,
  billingRateLimiter,
  async (req: any, res, next) => {
    try {
      const schema = z.object({
        code: z.string(),
        targetTier: z.enum(['professional', 'team']),
      });

      const { code, targetTier } = schema.parse(req.body);

      const result = await discountCodeService.validateDiscountCode(
        code,
        req.user.claims.sub,
        targetTier
      );

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      res.json({
        success: true,
        valid: true,
        discountCode: result.discountCode,
        discountAmount: result.discountAmount,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get user's discount code usage history
 */
discountCodeRouter.get(
  "/my-usage",
  secureAuthentication,
  readRateLimiter,
  async (req: any, res, next) => {
    try {
      const history = await discountCodeService.getUserDiscountHistory(req.user.claims.sub);

      res.json({
        success: true,
        history,
      });
    } catch (error) {
      next(error);
    }
  }
);
