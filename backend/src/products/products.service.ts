import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(productData: Partial<Product>): Promise<Product> {
    const newProduct = new this.productModel(productData);
    return await newProduct.save();
  }

  async findAll(): Promise<Product[]> {
    return await this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product | null> {
    return await this.productModel.findById(id).exec();
  }

  async update(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product | null> {
    return await this.productModel
      .findByIdAndUpdate(id, productData, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Product | null> {
    return await this.productModel.findByIdAndDelete(id).exec();
  }
}
