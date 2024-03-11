import { CategoryService } from './categories.service';
import { Controller, Get } from '@nestjs/common';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly categorySerice: CategoryService) {}

  @Get('getcategories')
  async getCategories() {
    return this.categorySerice.getCategories();
  }
}
