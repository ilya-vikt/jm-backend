import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaLibraryModule } from './media-library/media-library.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MediaLibraryModule,
  ],
})
export class AppModule {}
