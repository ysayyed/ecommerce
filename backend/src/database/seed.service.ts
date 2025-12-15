import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User, UserDocument } from '../users/user.schema';
import { Product, ProductDocument } from '../products/product.schema';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async seed() {
    try {
      this.logger.log('Starting database seeding...');

      // Check if data already exists
      const userCount = await this.userModel.countDocuments();
      const productCount = await this.productModel.countDocuments();

      if (userCount > 0 || productCount > 0) {
        this.logger.log(
          `Database already contains data (Users: ${userCount}, Products: ${productCount}). Skipping seed.`,
        );
        return;
      }

      // Seed users with encrypted passwords
      await this.seedUsers();

      // Seed products
      await this.seedProducts();

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Error during database seeding:', error);
      throw error;
    }
  }

  private async seedUsers() {
    try {
      // Handle both development and production paths
      let usersFilePath = path.join(__dirname, '../users/users.json');
      
      // If file doesn't exist (production), try the src directory
      if (!fs.existsSync(usersFilePath)) {
        usersFilePath = path.join(process.cwd(), 'src/users/users.json');
      }
      
      const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));

      this.logger.log(`Seeding ${usersData.length} users...`);

      // Encrypt passwords and insert users
      const usersWithEncryptedPasswords = await Promise.all(
        usersData.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return {
            ...user,
            password: hashedPassword,
          };
        }),
      );

      await this.userModel.insertMany(usersWithEncryptedPasswords);
      this.logger.log(`Successfully seeded ${usersData.length} users`);
    } catch (error) {
      this.logger.error('Error seeding users:', error);
      throw error;
    }
  }

  private async seedProducts() {
    try {
      // Handle both development and production paths
      let productsFilePath = path.join(
        __dirname,
        '../products/products.json',
      );
      
      // If file doesn't exist (production), try the src directory
      if (!fs.existsSync(productsFilePath)) {
        productsFilePath = path.join(process.cwd(), 'src/products/products.json');
      }
      
      const productsData = JSON.parse(
        fs.readFileSync(productsFilePath, 'utf8'),
      );

      this.logger.log(`Seeding ${productsData.length} products...`);

      // Remove MongoDB-specific _id field if present
      const cleanedProducts = productsData.map((product) => {
        const { _id, ...rest } = product;
        return rest;
      });

      await this.productModel.insertMany(cleanedProducts);
      this.logger.log(`Successfully seeded ${productsData.length} products`);
    } catch (error) {
      this.logger.error('Error seeding products:', error);
      throw error;
    }
  }
}