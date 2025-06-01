import { Module } from '@nestjs/common';
import { FileReaderService } from './file.service';
import { FileController } from './file.controller';

@Module({
  providers: [FileReaderService],
  controllers: [FileController],
})
export class FileModule {}
