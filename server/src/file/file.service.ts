import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileReaderService {
  async read(buffer: Buffer, extension: string): Promise<string> {
    switch (extension.toLowerCase()) {
      case '.txt':
        return buffer.toString('utf-8');
      case '.pdf':
        return (await pdfParse(buffer)).text;
      case '.docx':
        return (await mammoth.extractRawText({ buffer })).value;
      case '.epub':
        return this.readEpub(buffer);
      default:
        throw new UnsupportedMediaTypeException(
          `Неподдерживаемый формат: ${extension}`,
        );
    }
  }

  private async readEpub(buffer: Buffer): Promise<string> {
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.epub`);
    await fs.writeFile(tempFilePath, buffer);

    const EpubModule = await import('epub');
    const epub = new (EpubModule.default || EpubModule)(tempFilePath);

    const text = await new Promise<string>((resolve, reject) => {
      epub.on('error', reject);

      epub.on('end', () => {
        const chapters = epub.flow || [];
        let fullText = '';

        const loadChapter = (i = 0): void => {
          if (i >= chapters.length) {
            resolve(fullText);
            return;
          }
          epub.getChapter(
            chapters[i].id,
            (err: Error | null, chapterText: string) => {
              if (err) return reject(err);
              fullText += chapterText;
              loadChapter(i + 1);
            },
          );
        };

        loadChapter();
      });

      epub.parse();
    });

    await fs.unlink(tempFilePath);
    return text;
  }
}
