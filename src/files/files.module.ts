import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [FilesService, ConfigService]
})
export class FilesModule {}
