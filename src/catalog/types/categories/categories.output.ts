import { MediaFile } from 'src/media-library';

export type CategoryOutput = {
  id: number;
  parentId: number;
  name: string;
  slug: string;
  image: MediaFile;
};
