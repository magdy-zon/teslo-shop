import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

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
    const product = await this.productRepository.findOneBy(
      {id}
    );
    if(!product) 
      throw new NotFoundException('product not found');

    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleException(error: any) {

  }
}
