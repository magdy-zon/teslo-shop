import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor (
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const {images = [], ...productDetails} = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => 
          this.productImageRepository.create({url: image})
        )
      });
      await this.productRepository.save(product);
      return {...product, images};
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Help!')
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const {limit = 10, offset = 0} = paginationDto;
      const prods = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      });
      return prods.map(({images, ...rest}) => ({
        ...rest,
        images: images.map(f => f.url)
      }))
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
      const query = this.productRepository.createQueryBuilder('prod');
      product = await query
        .where('title =:title or slug =:slug', {
          title: term,
          slug: term
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }

    if(!product) 
      throw new NotFoundException('product not found');

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });
    
    if(!product)
    throw new NotFoundException('Product not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {product: {id}})
        
        product.images = images.map(img => 
          this.productImageRepository.create({url: img})
        );
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
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

  async deleteAllProducts() {
    const query = this.productImageRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleException(error)
    }
  }
}
