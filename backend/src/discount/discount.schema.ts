import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DiscountCodeDocument = DiscountCode & Document;

@Schema({ timestamps: true })
export class DiscountCode {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  discountPercentage: number;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ default: null })
  usedAt: Date;

  @Prop({ required: true })
  generatedForOrderNumber: number;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId;

  @Prop({ default: 'auto', enum: ['auto', 'manual'] })
  generationType: string;
}

export const DiscountCodeSchema = SchemaFactory.createForClass(DiscountCode);