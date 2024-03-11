import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterOutput } from './types/filters/filters.output';

@Injectable()
export class FilterService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * @param {number} categoryId id of the category for which you want to get filters
   * @returns {Promise<FilterOutput[]>} array of filters associated with the category
   *
   * The method gets filters associated with a category with id equal to categoryId,
   * If filters not found, an empty array is returned.
   */
  async getFiltersByCategory(categoryId: number): Promise<FilterOutput[]> {
    const filters = await this.prismaService.filters.findMany({
      select: {
        id: true,
        name: true,
        caption: true,
        meta: true,
        type: true,
        filtersValues: {
          select: {
            id: true,
            value: true,
          },
        },
      },
      where: {
        categories: {
          some: {
            id: categoryId,
          },
        },
      },
    });

    // We process the found filters: we select from the meta field only the values ​​​​for the desired category
    // If filtersValues ​​is not set for the current filter, then we return null.
    return filters.map((filter) => {
      const { filtersValues, meta, ...rest } = filter;
      return {
        ...rest,
        meta: { ...(meta[categoryId.toString()] ?? {}) },
        possibleValues: filtersValues.length ? filtersValues : null,
      };
    });
  }
}
