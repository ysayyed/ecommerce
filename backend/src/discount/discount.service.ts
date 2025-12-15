import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiscountCode, DiscountCodeDocument } from './discount.schema';

@Injectable()
export class DiscountService {
  constructor(
    @InjectModel(DiscountCode.name) private discountCodeModel: Model<DiscountCodeDocument>,
  ) {}

  /**
   * Get all discount codes
   */
  async getAllDiscountCodes(): Promise<DiscountCode[]> {
    return this.discountCodeModel.find().sort({ createdAt: -1 });
  }

  /**
   * Get discount code by code
   */
  async getDiscountByCode(code: string): Promise<DiscountCode | null> {
    return this.discountCodeModel.findOne({ code });
  }

  /**
   * Get available (unused) discount codes
   */
  async getAvailableDiscountCodes(): Promise<DiscountCode[]> {
    return this.discountCodeModel.find({ isUsed: false }).sort({ createdAt: -1 });
  }

  /**
   * Get used discount codes
   */
  async getUsedDiscountCodes(): Promise<DiscountCode[]> {
    return this.discountCodeModel.find({ isUsed: true }).sort({ usedAt: -1 });
  }
}