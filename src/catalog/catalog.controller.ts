import { CategoryService } from './categories.service';
import { FilterService } from './filters.service';
import { ProductService } from './products.service';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { SearchProductsInput } from './types/products/search-products.input';

@Controller('catalog')
export class CatalogController {
  constructor(
    private readonly categorySerice: CategoryService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService,
  ) {}

  @Get('getcategories')
  async getCategories() {
    return this.categorySerice.getCategories();
  }

  @Get('getfiltersbycategory/:id')
  async getFiltersByCategory(@Param('id', ParseIntPipe) categoryId: number) {
    return this.filterService.getFiltersByCategory(categoryId);
  }

  @Get('getproductbyid/:id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getProductById(id);
  }

  @Post('searchproducts')
  async serachProducts(
    @Body(new ValidationPipe())
    searchParams: SearchProductsInput,
  ) {
    return this.productService.serachProducts(searchParams);
  }
}
