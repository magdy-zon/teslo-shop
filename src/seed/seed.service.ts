import { Injectable } from '@nestjs/common';
import { initialData } from './seed';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService
  ) {}

  async runSeed() {
    await this.insertNewProducts();
    return true;
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts();
    await initialData.products.forEach(async e => {
      await this.productService.create(e);
    });
    return true;
  }
}
