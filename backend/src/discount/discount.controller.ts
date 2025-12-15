import { Controller, Get, UseGuards } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('discount')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  @Roles('admin')
  async getAllDiscountCodes() {
    return this.discountService.getAllDiscountCodes();
  }

  @Get('available')
  @Roles('admin')
  async getAvailableDiscountCodes() {
    return this.discountService.getAvailableDiscountCodes();
  }

  @Get('used')
  @Roles('admin')
  async getUsedDiscountCodes() {
    return this.discountService.getUsedDiscountCodes();
  }
}