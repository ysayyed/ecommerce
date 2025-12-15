import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { LoginDto } from 'src/auth/dto/login.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async adminLogin(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.adminService.adminLogin(loginDto);
  }

  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('nth-order-value')
  async getNthOrderValue() {
    return {
      nthOrder: this.adminService.getNthOrderValue(),
    };
  }

  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('products')
  async getAllProducts() {
    return this.adminService.getAllProducts();
  }
}
