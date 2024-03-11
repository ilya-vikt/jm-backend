import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaLibraryModule } from './media-library/media-library.module';
import { CatalogModule } from './catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MediaLibraryModule,
    CatalogModule,
  ],
})
export class AppModule {}
