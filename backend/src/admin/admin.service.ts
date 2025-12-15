import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/order.schema';
import {
  DiscountCode,
  DiscountCodeDocument,
} from '../discount/discount.schema';
import { User, UserDocument } from '../users/user.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from 'src/auth/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  private readonly nthOrder: number;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(DiscountCode.name)
    private discountCodeModel: Model<DiscountCodeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    // Get nth order value from environment or default to 3
    this.nthOrder = parseInt(this.configService.get<string>('NTH_ORDER', '3'));
  }

  /**
   * Get analytics data
   */
  async getAnalytics() {
    // Get total item count purchased
    const orders = await this.orderModel.find();
    const totalItemsPurchased = orders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    // Get total purchase amount
    const totalPurchaseAmount = orders.reduce(
      (total, order) => total + order.totalAmount,
      0,
    );

    // Get total discount amount
    const totalDiscountAmount = orders.reduce(
      (total, order) => total + order.discountAmount,
      0,
    );

    // Get all discount codes with user information
    const discountCodes = await this.discountCodeModel
      .find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return {
      totalItemsPurchased,
      totalPurchaseAmount,
      totalDiscountAmount,
      totalOrders: orders.length,
      discountCodes: discountCodes.map((code) => ({
        code: code.code,
        discountPercentage: code.discountPercentage,
        isUsed: code.isUsed,
        usedAt: code.usedAt,
        generatedForOrderNumber: code.generatedForOrderNumber,
        generationType: code.generationType,
        userName: (code as any).userId?.name || null,
      })),
    };
  }

  /**
   * Check if discount code should be generated for order number
   */
  shouldGenerateDiscountCode(orderNumber: number): boolean {
    return orderNumber % this.nthOrder === 0;
  }

  /**
   * Get nth order value
   */
  getNthOrderValue(): number {
    return this.nthOrder;
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<Order[]> {
    return this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().select('-password').sort({ createdAt: -1 });
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    return this.productModel.find().sort({ createdAt: -1 });
  }

  async adminLogin(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email, role: 'admin' });
    if (!user) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Admin account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
