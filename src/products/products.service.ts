import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor (
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Help!')
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const {limit = 10, offset = 0} = paginationDto;
      return this.productRepository.find({
        take: limit,
        skip: offset
      });
    } catch (error) {
      throw new InternalServerErrorException('Help in findAll!')
    }
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term))
      product = await this.productRepository.findOneBy(
        {id: term}
      );
    else {
      const query = this.productRepository.createQueryBuilder();
      product = await query
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term
        }).getOne()
    }

    if(!product) 
      throw new NotFoundException('product not found');

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    
    if(!product)
    throw new NotFoundException('Product not found');

    try {
      await this.productRepository.save(product);
      return
    } catch (error) {
      this.handleException(error);
    }

    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleException(error: any) {
    throw new Error('failed ' + error);
  }
}
