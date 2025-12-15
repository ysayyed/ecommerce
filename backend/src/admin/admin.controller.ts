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
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async adminLogin(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.adminService.adminLogin(loginDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('nth-order-value')
  async getNthOrderValue() {
    return {
      nthOrder: this.adminService.getNthOrderValue(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('products')
  async getAllProducts() {
    return this.adminService.getAllProducts();
  }
}
