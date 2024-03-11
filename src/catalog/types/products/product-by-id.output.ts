import { FilterType } from 'src/catalog/types/filters/filters';
import { MediaFile } from 'src/media-library';

export type ProductByIdOutput = {
  id: number;
  name: string;
  categoryId: number;
  description: string;
  price: number;
  thumb: MediaFile;
  gallery: MediaFile[];
  features: {
    id: number;
    name: string;
    caption: string;
    value: number | boolean | string | string[];
    type: FilterType;
  }[];
};
