import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order } from './order.schema';
import { Cart } from '../cart/cart.schema';
import { Product } from '../products/product.schema';
import { DiscountCode } from '../discount/discount.schema';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockOrderModel: any;
  let mockCartModel: any;
  let mockProductModel: any;
  let mockDiscountCodeModel: any;

  beforeEach(async () => {
    mockOrderModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      countDocuments: jest.fn(),
    };

    mockCartModel = {
      findOne: jest.fn(),
    };

    mockProductModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockDiscountCodeModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getModelToken(Order.name),
          useValue: mockOrderModel,
        },
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(DiscountCode.name),
          useValue: mockDiscountCodeModel,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkout', () => {
    it('should create order without discount', async () => {
      const userId = 'user-id';
      const checkoutDto = {};

      const mockCart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId('product-id'),
            name: 'Test Product',
            price: 100,
            quantity: 2,
          },
        ],
        totalAmount: 200,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockProduct = {
        _id: 'product-id',
        stock: 10,
      };

      const mockOrder = {
        _id: 'order-id',
        userId: new Types.ObjectId(userId),
        items: mockCart.items,
        totalAmount: 200,
        discountAmount: 0,
        finalAmount: 200,
        orderNumber: 1,
      };

      mockCartModel.findOne.mockResolvedValue(mockCart);
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockOrderModel.findOne.mockResolvedValue(null);
      mockOrderModel.create.mockResolvedValue(mockOrder);
      mockProductModel.findByIdAndUpdate.mockResolvedValue(true);

      const result = await service.checkout(userId, checkoutDto);

      expect(result).toBeDefined();
      expect(result.totalAmount).toBe(200);
      expect(result.discountAmount).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should create order with valid discount code', async () => {
      const userId = 'user-id';
      const checkoutDto = { discountCode: 'DISCOUNT10' };

      const mockCart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId('product-id'),
            name: 'Test Product',
            price: 100,
            quantity: 2,
          },
        ],
        totalAmount: 200,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockProduct = {
        _id: 'product-id',
        stock: 10,
      };

      const mockDiscount = {
        code: 'DISCOUNT10',
        discountPercentage: 10,
        isUsed: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockOrder = {
        _id: 'order-id',
        userId: new Types.ObjectId(userId),
        items: mockCart.items,
        totalAmount: 200,
        discountAmount: 20,
        finalAmount: 180,
        orderNumber: 1,
      };

      mockCartModel.findOne.mockResolvedValue(mockCart);
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockDiscountCodeModel.findOne.mockResolvedValue(mockDiscount);
      mockOrderModel.findOne.mockResolvedValue(null);
      mockOrderModel.create.mockResolvedValue(mockOrder);
      mockProductModel.findByIdAndUpdate.mockResolvedValue(true);

      const result = await service.checkout(userId, checkoutDto);

      expect(result).toBeDefined();
      expect(result.discountAmount).toBe(20);
      expect(result.finalAmount).toBe(180);
      expect(mockDiscount.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty cart', async () => {
      const userId = 'user-id';
      const checkoutDto = {};

      mockCartModel.findOne.mockResolvedValue({ items: [] });

      await expect(service.checkout(userId, checkoutDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid discount code', async () => {
      const userId = 'user-id';
      const checkoutDto = { discountCode: 'INVALID' };

      const mockCart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId('product-id'),
            name: 'Test Product',
            price: 100,
            quantity: 2,
          },
        ],
        totalAmount: 200,
      };

      const mockProduct = {
        _id: 'product-id',
        stock: 10,
      };

      mockCartModel.findOne.mockResolvedValue(mockCart);
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockDiscountCodeModel.findOne.mockResolvedValue(null);

      await expect(service.checkout(userId, checkoutDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});