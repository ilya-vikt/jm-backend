import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductByIdOutput } from 'src/catalog/types/products/product-by-id.output';
import { MediaLibraryService } from 'src/media-library/madia-library.service';
import { SearchProductsInput } from './types/products/search-products.input';
import { createSearchQuery } from './queries/search-query';
import { SearchProductsOutput } from './types/products/search-products.output';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mediaLibraryService: MediaLibraryService,
  ) {}

  /**
   *
   * @param {number} id product identifier
   * @returns {Promise<ProductByIdOutput>} Product details
   *
   * Gets information about a product with a given id
   */
  async getProductById(id: number): Promise<ProductByIdOutput> {
    const product = await this.prismaService.products.findUnique({
      select: {
        id: true,
        name: true,
        price: true,
        categoryId: true,
        description: true,
        thumb: {
          select: {
            id: true,
            alt: true,
            urls: true,
            width: true,
            height: true,
          },
        },
        gallery: true,
        productsFiltersValues: {
          select: {
            value: true,
            filters: {
              select: {
                id: true,
                name: true,
                caption: true,
                type: true,
              },
            },
          },
          orderBy: {
            filters: {
              caption: 'asc',
            },
          },
        },
      },
      where: { id },
    });

    if (!product) throw new NotFoundException();
    const { gallery: galleryIds, productsFiltersValues, ...rest } = product;

    //Preparing gallery field, It is get gallery as MediaFile[] from galleryIds
    const gallery = await this.mediaLibraryService.getGallery(galleryIds);

    //Values ​​for LIST and MULTILIST filters are stored as identifiers.
    //For them, you need to additionally request the name of the filter value from the filtersValues ​​table
    //1. Get all id values
    const ids = productsFiltersValues.reduce((acc, filter) => {
      if (filter.filters.type === 'LIST') {
        acc.push(+filter.value);
      }
      if (filter.filters.type === 'MULTILIST') {
        acc.push(...filter.value.split(',').map(Number));
      }

      return acc;
    }, []);

    //2. Request names for values
    const filterValuesName = await this.prismaService.filtersValues.findMany({
      select: {
        id: true,
        value: true,
      },
      where: {
        id: {
          in: ids,
        },
      },
    });

    const features = productsFiltersValues.map(({ filters, value }) => ({
      id: filters.id,
      name: filters.name,
      caption: filters.caption,
      type: filters.type,
      value: (() => {
        if (filters.type === 'NUMBER') return +value;
        if (filters.type === 'BOOLEAN') return !!value;
        if (filters.type === 'LIST') {
          return filterValuesName.find((el) => el.id === +value)?.value ?? '';
        }
        if (filters.type === 'MULTILIST') {
          return value
            .split(',')
            .map(
              (id) => filterValuesName.find((el) => el.id === +id)?.value ?? '',
            );
        }
      })(),
    }));

    return {
      ...rest,
      gallery,
      features,
    };
  }

  /**
   *
   * @param {SearchProductsInput['appliedFilters']} filters values ​​of installed filters
   * @returns {string} temporary table name
   * Creates a temporary table and fills it with the values ​​of the installed filters.
   * This table allows you to filter products using specified filters
   */
  private async createTempTable(
    filters: SearchProductsInput['appliedFilters'],
  ): Promise<string> {
    const tableName = 'temp_' + crypto.randomUUID().replaceAll('-', '');
    const filtersString = filters
      .map(({ id, value }) => `(${id}, '${value}')`)
      .join(',');

    try {
      await this.prismaService.$executeRawUnsafe(
        `CREATE TEMPORARY TABLE ${tableName} (filter_id INT, value VARCHAR(255));`,
      );

      await this.prismaService.$executeRawUnsafe(
        `INSERT INTO ${tableName} (filter_id, value) VALUES ${filtersString};`,
      );
    } catch {
      throw new InternalServerErrorException();
    }
    return tableName;
  }

  /**
   *
   * @param {string} tableName table name
   * Destroys a temporary table
   */
  private async removeTempTable(tableName: string) {
    try {
      await this.prismaService.$executeRawUnsafe(
        ` DROP TABLE IF EXISTS ${tableName};`,
      );
    } catch {
      throw new InternalServerErrorException();
    }
  }

  /**
   *
   * @param {number | null}categoryId category id
   * @returns {Promise<number[] | null>}
   * An auxiliary function that generates an array of category ids.
   * If categoryId is the root category, then an array of category ids
   * for which categoryId is the parent is returned
   * If categoryId is a second-level category, then an array of one element equal to categoryId is returned
   */
  private async getCategoriesIds(
    categoryId: number | null,
  ): Promise<number[] | null> {
    if (categoryId === null) return null;
    const categories = await this.prismaService.categories.findMany({
      select: {
        id: true,
        parentId: true,
      },
      where: {
        OR: [
          {
            id: categoryId,
          },
          {
            parentId: categoryId,
          },
        ],
      },
    });
    if (categories.length === 0) {
      throw new BadRequestException('The categoryId is wrong');
    }

    return categories.some((cat) => cat.parentId === 0)
      ? categories.filter((cat) => cat.parentId !== 0).map(({ id }) => id)
      : [categoryId];
  }

  /**
   *
   * @param {SearchProductsInput} searchParams search parameters
   * @returns {Promise<SearchProductsOutput[]>} array of products that match the search conditions
   * The function searches for products that meet the search conditions
   */
  async serachProducts(
    searchParams: SearchProductsInput,
  ): Promise<SearchProductsOutput[]> {
    const tempTableName = searchParams.appliedFilters
      ? await this.createTempTable(searchParams.appliedFilters)
      : null;
    const categories = await this.getCategoriesIds(searchParams.categoryId);
    const queryString = createSearchQuery(
      searchParams.searchString,
      categories,
      !!searchParams.appliedFilters,
      tempTableName,
    );

    const products: (Omit<SearchProductsOutput, 'thumb' | 'gallery'> & {
      gallery: string[];
      thumb_id: string;
    })[] = await this.prismaService.$queryRawUnsafe(queryString);

    if (searchParams.appliedFilters) {
      this.removeTempTable(tempTableName);
    }

    if (products.length === 0) {
      return [];
    }

    return Promise.all(
      products.map(async (product) => {
        const { thumb_id, gallery, ...rest } = product;
        return {
          ...rest,
          thumb: await this.mediaLibraryService.getMediaFile(thumb_id),
          gallery: await this.mediaLibraryService.getGallery(gallery),
        };
      }),
    );
  }
}
