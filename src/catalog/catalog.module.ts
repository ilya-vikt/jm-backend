import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CategoryService } from './categories.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaLibraryService } from 'src/media-library/madia-library.service';

@Module({
  controllers: [CatalogController],
  providers: [PrismaService, CategoryService, MediaLibraryService],
})
export class CatalogModule {}
