import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Order, OrderSchema } from '../orders/order.schema';
import { DiscountCode, DiscountCodeSchema } from '../discount/discount.schema';
import { User, UserSchema } from '../users/user.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { AuthModule } from '../auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: DiscountCode.name, schema: DiscountCodeSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, ConfigService, JwtService],
  exports: [AdminService],
})
export class AdminModule {}
