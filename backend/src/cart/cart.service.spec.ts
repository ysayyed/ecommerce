import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CartService } from './cart.service';
import { Cart } from './cart.schema';
import { Product } from '../products/product.schema';

describe('CartService', () => {
  let service: CartService;
  let mockCartModel: any;
  let mockProductModel: any;

  beforeEach(async () => {
    mockCartModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockProductModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const userId = 'user-id';
      const addToCartDto = {
        productId: 'product-id',
        quantity: 2,
      };

      const mockProduct = {
        _id: 'product-id',
        name: 'Test Product',
        price: 100,
        stock: 10,
      };

      const mockCart = {
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockCartModel.findOne.mockResolvedValue(null);
      mockCartModel.create.mockResolvedValue(mockCart);

      const result = await service.addToCart(userId, addToCartDto);

      expect(mockProductModel.findById).toHaveBeenCalledWith(addToCartDto.productId);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if product not found', async () => {
      const userId = 'user-id';
      const addToCartDto = {
        productId: 'invalid-product-id',
        quantity: 2,
      };

      mockProductModel.findById.mockResolvedValue(null);

      await expect(service.addToCart(userId, addToCartDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const userId = 'user-id';
      const addToCartDto = {
        productId: 'product-id',
        quantity: 20,
      };

      const mockProduct = {
        _id: 'product-id',
        name: 'Test Product',
        price: 100,
        stock: 5,
      };

      mockProductModel.findById.mockResolvedValue(mockProduct);

      await expect(service.addToCart(userId, addToCartDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const userId = 'user-id';
      const productId = 'product-id';

      const mockCart = {
        userId: new Types.ObjectId(userId),
        items: [
          {
            productId: new Types.ObjectId(productId),
            name: 'Test Product',
            price: 100,
            quantity: 2,
          },
        ],
        totalAmount: 200,
        save: jest.fn().mockResolvedValue(true),
      };

      mockCartModel.findOne.mockResolvedValue(mockCart);

      const result = await service.removeFromCart(userId, productId);

      expect(result.items.length).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart not found', async () => {
      const userId = 'user-id';
      const productId = 'product-id';

      mockCartModel.findOne.mockResolvedValue(null);

      await expect(service.removeFromCart(userId, productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});