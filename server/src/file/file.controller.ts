import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { FileReaderService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileReaderService: FileReaderService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен');
    }

    const extension = extname(file.originalname).toLowerCase();

    try {
      const text = await this.fileReaderService.read(file.buffer, extension);
      return { text };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      } else {
        throw new BadRequestException('Неизвестная ошибка');
      }
    }
  }
}
