import { CategoryService } from './categories.service';
import { FilterService } from './filters.service';
import { ProductService } from './products.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

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
}
