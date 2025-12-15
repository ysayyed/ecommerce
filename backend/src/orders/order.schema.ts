import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ default: null })
  discountCode: string;

  @Prop({ required: true })
  finalAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'cancelled'] })
  status: string;

  @Prop({ required: true })
  orderNumber: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);