import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user._id);
  }

  @Post('items')
  async addToCart(
    @Request() req,
    @Body(ValidationPipe) addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(req.user._id, addToCartDto);
  }

  @Put('items/:productId')
  async updateCartItem(
    @Request() req,
    @Param('productId') productId: string,
    @Body(ValidationPipe) updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user._id, productId, updateCartItemDto);
  }

  @Delete('items/:productId')
  async removeFromCart(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeFromCart(req.user._id, productId);
  }

  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user._id);
  }
}