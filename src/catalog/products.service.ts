import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductByIdOutput } from 'src/catalog/types/products/product-by-id.output';
import { MediaLibraryService } from 'src/media-library/madia-library.service';

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
}
