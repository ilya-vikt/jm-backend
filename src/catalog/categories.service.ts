import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryOutput } from './types/categories/categories.output';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * This method gets a list of all product categories as an array
   * @returns {Promise<CategoryOutput[]>}
   */
  async getCategories(): Promise<CategoryOutput[]> {
    return this.prismaService.categories.findMany({
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        image: {
          select: {
            id: true,
            alt: true,
            urls: true,
            width: true,
            height: true,
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    });
  }
}
