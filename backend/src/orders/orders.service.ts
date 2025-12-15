import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { Cart, CartDocument } from '../cart/cart.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { DiscountCode, DiscountCodeDocument } from '../discount/discount.schema';
import { User, UserDocument } from '../users/user.schema';
import { CheckoutDto } from './dto/checkout.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  private readonly nthOrder: number;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(DiscountCode.name) private discountCodeModel: Model<DiscountCodeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {
    // Get nth order value from environment or default to 3
    this.nthOrder = parseInt(this.configService.get<string>('NTH_ORDER', '3'));
  }

  /**
   * Check if an order number is eligible for a discount
   * Discounts are available for orders that are multiples of n (3, 6, 9, 12...)
   */
  private isDiscountEligibleOrder(orderNumber: number, n: number): boolean {
    return orderNumber > 0 && orderNumber % n === 0;
  }

  /**
   * Check if we should generate a discount after completing this order
   * Generate discount after orders (n-1, 2n-1, 3n-1...) i.e., (2, 5, 8, 11...)
   * This generates discount codes for the NEXT order (3, 6, 9, 12...)
   */
  private shouldGenerateDiscountAfterOrder(orderNumber: number, n: number): boolean {
    return orderNumber >= (n - 1) && (orderNumber - (n - 1)) % n === 0;
  }

  /**
   * Generate automatic discount code for eligible orders (user-specific)
   * This generates a discount for a specific order number (3, 6, 9, 12...)
   */
  private async generateAutomaticDiscount(userId: string, forOrderNumber: number): Promise<DiscountCode | null> {
    // Check if discount code already exists for this user and order number
    const existingCode = await this.discountCodeModel.findOne({
      userId: new Types.ObjectId(userId),
      generatedForOrderNumber: forOrderNumber,
    });

    if (existingCode) {
      return existingCode;
    }

    // Generate unique code
    const code = `AUTO${forOrderNumber}-${Date.now()}`;

    // Create discount code with 10% discount
    const discountCode = await this.discountCodeModel.create({
      code,
      discountPercentage: 10,
      isUsed: false,
      generatedForOrderNumber: forOrderNumber,
      userId: new Types.ObjectId(userId),
      generationType: 'auto',
    });

    return discountCode;
  }

  /**
   * Checkout - Create order from cart with optional discount code
   */
  async checkout(userId: string, checkoutDto: CheckoutDto): Promise<Order> {
    const { discountCode } = checkoutDto;

    // Get user's cart
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.name} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.name}. Available: ${product.stock}`
        );
      }
    }

    // Get user to check totalOrders
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate next order number for this user
    const userNextOrderNumber = user.totalOrders + 1;

    let discountAmount = 0;
    let validDiscountCode: string | null = null;

    // Validate discount code if provided
    if (discountCode) {
      const discount = await this.discountCodeModel.findOne({ code: discountCode });
      
      if (!discount) {
        throw new BadRequestException('Invalid discount code');
      }

      if (discount.isUsed) {
        throw new BadRequestException('Discount code has already been used');
      }

      // Check if discount is user-specific
      if (discount.userId && discount.userId.toString() !== userId.toString()) {
        throw new BadRequestException('This discount code is not valid for your account');
      }

      // Calculate discount
      discountAmount = (cart.totalAmount * discount.discountPercentage) / 100;
      validDiscountCode = discountCode;

      // Mark discount as used
      discount.isUsed = true;
      discount.usedAt = new Date();
      await discount.save();
    }

    const finalAmount = cart.totalAmount - discountAmount;

    // Get next global order number
    const lastOrder = await this.orderModel.findOne().sort({ orderNumber: -1 });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    // Create order
    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: cart.items,
      totalAmount: cart.totalAmount,
      discountAmount,
      discountCode: validDiscountCode,
      finalAmount,
      status: 'completed',
      orderNumber,
    });

    // Update product stock
    for (const item of cart.items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update user's totalOrders count
    user.totalOrders = userNextOrderNumber;
    await user.save();

    // Check if we should generate a discount after completing this order
    // For n=3: Generate discount after orders 2, 5, 8, 11... for use on orders 3, 6, 9, 12...
    if (this.shouldGenerateDiscountAfterOrder(userNextOrderNumber, this.nthOrder)) {
      // Calculate which order this discount is for (next order will be a multiple of n)
      const discountForOrderNumber = userNextOrderNumber + 1;
      await this.generateAutomaticDiscount(userId, discountForOrderNumber);
    }

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
  }

  /**
   * Get available discount for user's next order
   * Returns user-specific discount OR admin-created discount for all users
   * Only returns discount if next order is eligible (multiple of n)
   */
  async getAvailableDiscount(userId: string): Promise<DiscountCode | null> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return null;
    }

    const nextOrderNumber = user.totalOrders + 1;
    
    // Check if next order is eligible for discount (must be multiple of n)
    // For n=3: Orders 3, 6, 9, 12... are eligible
    if (!this.isDiscountEligibleOrder(nextOrderNumber, this.nthOrder)) {
      return null;
    }

    // First, try to find user-specific discount
    let discount = await this.discountCodeModel.findOne({
      userId: new Types.ObjectId(userId),
      generatedForOrderNumber: nextOrderNumber,
      isUsed: false,
    });

    // If no user-specific discount, check for admin-created discount for all users
    if (!discount) {
      discount = await this.discountCodeModel.findOne({
        userId: null, // Admin-created for all users
        generatedForOrderNumber: nextOrderNumber,
        isUsed: false,
      });
    }

    return discount;
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  /**
   * Get order by ID
   */
  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 });
  }

  /**
   * Get total order count
   */
  async getTotalOrderCount(): Promise<number> {
    return this.orderModel.countDocuments();
  }
}