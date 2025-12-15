import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async checkout(
    @Request() req,
    @Body(ValidationPipe) checkoutDto: CheckoutDto,
  ) {
    return this.ordersService.checkout(req.user._id, checkoutDto);
  }

  @Get()
  async getUserOrders(@Request() req) {
    return this.ordersService.getUserOrders(req.user._id);
  }

  @Get('available-discount/check')
  async getAvailableDiscount(@Request() req) {
    return this.ordersService.getAvailableDiscount(req.user._id);
  }

  @Get(':id')
  async getOrderById(@Request() req, @Param('id') id: string) {
    return this.ordersService.getOrderById(req.user._id, id);
  }
}