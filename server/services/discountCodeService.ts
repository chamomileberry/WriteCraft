import { db } from "../db";
import { discountCodes, discountCodeUsage, userSubscriptions, type DiscountCode, type InsertDiscountCode, insertDiscountCodeSchema } from "@shared/schema";
import { eq, and, or, sql, desc, gte, lte } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

interface ValidationResult {
  valid: boolean;
  error?: string;
  discountCode?: DiscountCode;
  discountAmount?: number;
}

export class DiscountCodeService {
  /**
   * Create a new discount code (admin only)
   */
  async createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode> {
    // Normalize code to uppercase
    const normalizedCode = data.code.toUpperCase();

    // For percentage discounts, create Stripe coupon
    let stripeCouponId: string | null = null;
    if (data.type === 'percentage') {
      const coupon = await stripe.coupons.create({
        percent_off: data.value,
        duration: data.duration as 'once' | 'repeating' | 'forever',
        duration_in_months: data.durationInMonths || undefined,
        name: data.name,
      });
      stripeCouponId = coupon.id;
    }

    const [code] = await db
      .insert(discountCodes)
      .values({
        ...data,
        code: normalizedCode,
        stripeCouponId,
      })
      .returning();

    return code;
  }

  /**
   * Get all discount codes (admin only)
   */
  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return db
      .select()
      .from(discountCodes)
      .orderBy(desc(discountCodes.createdAt));
  }

  /**
   * Get discount code by ID (admin only)
   */
  async getDiscountCodeById(id: string): Promise<DiscountCode | undefined> {
    const [code] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);

    return code;
  }

  /**
   * Update discount code (admin only)
   */
  async updateDiscountCode(id: string, updates: Partial<InsertDiscountCode>): Promise<DiscountCode> {
    // Get existing code
    const existingCode = await this.getDiscountCodeById(id);
    if (!existingCode) {
      throw new Error('Discount code not found');
    }

    // Create update schema with proper validation
    const updateSchema = z.object({
      code: z.string().min(3).max(50).toUpperCase().optional(),
      name: z.string().min(1).optional(),
      type: z.enum(['percentage', 'fixed']).optional(),
      value: z.number().min(1).optional(),
      applicableTiers: z.array(z.enum(['professional', 'team'])).min(1).optional(),
      maxUses: z.number().min(0).optional().nullable(),
      maxUsesPerUser: z.number().min(1).optional(),
      duration: z.enum(['once', 'repeating', 'forever']).optional(),
      durationInMonths: z.number().min(1).max(36).optional().nullable(),
      startsAt: z.coerce.date().optional(),
      expiresAt: z.coerce.date().optional().nullable(),
      active: z.boolean().optional(),
    }).strict(); // Reject unknown fields

    // Validate updates against schema
    const validatedUpdates = updateSchema.parse(updates);

    // Determine effective type after updates
    const effectiveType = validatedUpdates.type || existingCode.type;
    const effectiveValue = validatedUpdates.value !== undefined ? validatedUpdates.value : existingCode.value;
    const effectiveDuration = validatedUpdates.duration || existingCode.duration;
    const effectiveDurationInMonths = validatedUpdates.durationInMonths !== undefined 
      ? validatedUpdates.durationInMonths 
      : existingCode.durationInMonths;

    // Validate percentage value (check effective type, not just validatedUpdates.type)
    if (effectiveType === 'percentage' && effectiveValue > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    // Validate repeating duration
    if (effectiveDuration === 'repeating' && !effectiveDurationInMonths) {
      throw new Error('Duration in months is required for repeating discounts');
    }

    // When switching to percentage, ensure required fields are present
    if (validatedUpdates.type === 'percentage' && existingCode.type !== 'percentage') {
      if (validatedUpdates.value === undefined) {
        throw new Error('Percentage value is required when switching to percentage discount');
      }
      if (!validatedUpdates.duration) {
        throw new Error('Duration is required when switching to percentage discount');
      }
      if (validatedUpdates.duration === 'repeating' && !validatedUpdates.durationInMonths) {
        throw new Error('Duration in months is required for repeating percentage discounts');
      }
    }

    // Determine if Stripe coupon needs to be updated
    const typeChangedToPercentage = validatedUpdates.type === 'percentage' && existingCode.type !== 'percentage';
    const typeChangedFromPercentage = validatedUpdates.type && validatedUpdates.type !== 'percentage' && existingCode.type === 'percentage';
    const percentageDetailsChanged = 
      existingCode.type === 'percentage' && 
      effectiveType === 'percentage' && (
        (validatedUpdates.value !== undefined && validatedUpdates.value !== existingCode.value) ||
        (validatedUpdates.duration !== undefined && validatedUpdates.duration !== existingCode.duration) ||
        (validatedUpdates.durationInMonths !== undefined && validatedUpdates.durationInMonths !== existingCode.durationInMonths)
      );

    let stripeCouponId = existingCode.stripeCouponId;

    // Handle Stripe coupon updates
    if (typeChangedToPercentage) {
      // Creating new percentage discount - create Stripe coupon
      const coupon = await stripe.coupons.create({
        percent_off: validatedUpdates.value!,
        duration: validatedUpdates.duration as 'once' | 'repeating' | 'forever',
        duration_in_months: validatedUpdates.durationInMonths || undefined,
        name: validatedUpdates.name || existingCode.name,
      });
      stripeCouponId = coupon.id;
    } else if (typeChangedFromPercentage) {
      // Switching from percentage to fixed - delete Stripe coupon
      if (existingCode.stripeCouponId) {
        try {
          await stripe.coupons.del(existingCode.stripeCouponId);
        } catch (error) {
          console.error('Error deleting Stripe coupon:', error);
        }
      }
      stripeCouponId = null;
    } else if (percentageDetailsChanged && existingCode.stripeCouponId) {
      // Percentage details changed - recreate Stripe coupon
      try {
        await stripe.coupons.del(existingCode.stripeCouponId);
      } catch (error) {
        console.error('Error deleting old Stripe coupon:', error);
      }

      const coupon = await stripe.coupons.create({
        percent_off: effectiveValue,
        duration: effectiveDuration as 'once' | 'repeating' | 'forever',
        duration_in_months: effectiveDurationInMonths || undefined,
        name: validatedUpdates.name || existingCode.name,
      });
      stripeCouponId = coupon.id;
    }

    // Code is already normalized to uppercase by Zod schema
    const normalizedUpdates = validatedUpdates;

    const [updated] = await db
      .update(discountCodes)
      .set({
        ...normalizedUpdates,
        stripeCouponId,
        updatedAt: new Date(),
      })
      .where(eq(discountCodes.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete discount code (admin only)
   */
  async deleteDiscountCode(id: string): Promise<void> {
    const code = await this.getDiscountCodeById(id);
    
    // Delete Stripe coupon if exists
    if (code?.stripeCouponId) {
      try {
        await stripe.coupons.del(code.stripeCouponId);
      } catch (error) {
        console.error('Error deleting Stripe coupon:', error);
      }
    }

    await db
      .delete(discountCodes)
      .where(eq(discountCodes.id, id));
  }

  /**
   * Validate discount code for a user and tier
   */
  async validateDiscountCode(
    code: string,
    userId: string,
    targetTier: 'professional' | 'team'
  ): Promise<ValidationResult> {
    const normalizedCode = code.toUpperCase();

    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, normalizedCode))
      .limit(1);

    if (!discountCode) {
      return { valid: false, error: 'Invalid discount code' };
    }

    // Check if code is active
    if (!discountCode.active) {
      return { valid: false, error: 'This discount code is no longer active' };
    }

    // Check if tier is applicable
    if (!discountCode.applicableTiers.includes(targetTier)) {
      return { valid: false, error: `This code is not valid for the ${targetTier} tier` };
    }

    // Check validity period
    const now = new Date();
    if (discountCode.startsAt && new Date(discountCode.startsAt) > now) {
      return { valid: false, error: 'This code is not yet active' };
    }
    if (discountCode.expiresAt && new Date(discountCode.expiresAt) < now) {
      return { valid: false, error: 'This code has expired' };
    }

    // Check max uses
    if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
      return { valid: false, error: 'This code has reached its usage limit' };
    }

    // Check per-user usage limit
    const userUsageCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(discountCodeUsage)
      .where(
        and(
          eq(discountCodeUsage.discountCodeId, discountCode.id),
          eq(discountCodeUsage.userId, userId)
        )
      );

    const usageCount = userUsageCount[0]?.count || 0;
    if (usageCount >= discountCode.maxUsesPerUser) {
      return { valid: false, error: 'You have already used this code' };
    }

    return {
      valid: true,
      discountCode,
      discountAmount: discountCode.value,
    };
  }

  /**
   * Calculate discount amount for subscription
   */
  calculateDiscountAmount(
    discountCode: DiscountCode,
    subscriptionPriceCents: number
  ): number {
    if (discountCode.type === 'percentage') {
      return Math.round((subscriptionPriceCents * discountCode.value) / 100);
    } else {
      // Fixed amount
      return Math.min(discountCode.value, subscriptionPriceCents);
    }
  }

  /**
   * Apply discount code to a subscription (records usage)
   */
  async applyDiscountCode(
    discountCodeId: string,
    userId: string,
    subscriptionId: string,
    discountAmount: number
  ): Promise<void> {
    // Record usage
    await db.insert(discountCodeUsage).values({
      discountCodeId,
      userId,
      subscriptionId,
      discountAmount,
    });

    // Increment current uses
    await db
      .update(discountCodes)
      .set({
        currentUses: sql`${discountCodes.currentUses} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(discountCodes.id, discountCodeId));
  }

  /**
   * Get discount code usage statistics
   */
  async getCodeUsageStats(discountCodeId: string) {
    const [code] = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, discountCodeId))
      .limit(1);

    if (!code) {
      throw new Error('Discount code not found');
    }

    const usageRecords = await db
      .select()
      .from(discountCodeUsage)
      .where(eq(discountCodeUsage.discountCodeId, discountCodeId))
      .orderBy(desc(discountCodeUsage.usedAt));

    const totalSavings = usageRecords.reduce(
      (sum, record) => sum + record.discountAmount,
      0
    );

    return {
      code,
      usageCount: usageRecords.length,
      totalSavings,
      recentUsage: usageRecords.slice(0, 10),
    };
  }

  /**
   * Get user's discount code usage history
   */
  async getUserDiscountHistory(userId: string) {
    return db
      .select({
        usage: discountCodeUsage,
        code: discountCodes,
      })
      .from(discountCodeUsage)
      .leftJoin(
        discountCodes,
        eq(discountCodeUsage.discountCodeId, discountCodes.id)
      )
      .where(eq(discountCodeUsage.userId, userId))
      .orderBy(desc(discountCodeUsage.usedAt));
  }
}

export const discountCodeService = new DiscountCodeService();
