import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MediaFile } from './types/media-file';

@Injectable()
export class MediaLibraryService {
  constructor(readonly prismaService: PrismaService) {}

  /**
   *
   * @param {string} id identifier of the media file being searched
   * @returns {Promise<MediaFile | null>} returns media file data or null if no media file
   * with this id is registered
   *
   * The method gets data about a media file from the media library by identifier.
   */
  async getMediaFile(id: string): Promise<MediaFile | null> {
    return await this.prismaService.mediaLibrary.findFirst({
      select: {
        id: true,
        urls: true,
        height: true,
        width: true,
        alt: true,
      },
      where: {
        id,
      },
    });
  }

  /**
   *
   * @param {string[]} id array containing the identifiers of the searched media files
   * @returns {Promise<MediaFile[] | null>} the data of media files is returned in the
   * form of an array or null if there are no media files with such ids registered
   *
   * The method receives data about media files from the media library using arrays of identifiers.
   */
  async getGallery(ids: string[]): Promise<MediaFile[] | null> {
    return await this.prismaService.mediaLibrary.findMany({
      select: {
        id: true,
        urls: true,
        height: true,
        width: true,
        alt: true,
      },
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
