import { MediaFile } from 'src/media-library';

export type SearchProductsOutput = {
  id: number;
  name: string;
  categoryId: number;
  description: string;
  price: number;
  marketingPrice: number | null;
  thumb: MediaFile;
  gallery: MediaFile[];
};
