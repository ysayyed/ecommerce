import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '../users/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      const signupDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'user-id',
        name: signupDto.name,
        email: signupDto.email,
        role: 'user',
      });

      const result = await service.signup(signupDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(signupDto.email);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: signupDto.email });
    });

    it('should throw ConflictException if user already exists', async () => {
      const signupDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserModel.findOne.mockResolvedValue({ email: signupDto.email });

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        _id: 'user-id',
        name: 'Test User',
        email: loginDto.email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'user-id',
        email: loginDto.email,
        password: 'hashed-password',
        isActive: false,
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});