import { Module } from '@nestjs/common';
import { MediaLibraryService } from './madia-library.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [MediaLibraryService, PrismaService],
})
export class MediaLibraryModule {}
