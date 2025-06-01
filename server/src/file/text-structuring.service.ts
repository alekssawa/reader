import { Injectable } from '@nestjs/common';

@Injectable()
export class TextStructuringService {
  structureText(rawText: string) {
    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Попытка определить title и author из первых нескольких строк
    const title = lines[0] || '';
    const author = lines[1] && lines[1].length < 100 ? lines[1] : '';

    // Находим индексы потенциальных заголовков глав по паттернам
    const chapterIndices: number[] = [];

    lines.forEach((line, i) => {
      // Правила для заголовков глав (пример):
      // - строка полностью в верхнем регистре (за исключением коротких слов)
      // - строка начинается с "ГЛАВА" или "РОЗДІЛ" или с цифр
      // - строка короткая (до 50 символов) и выделяется пробелами/заглавными
      const isAllCaps = line === line.toUpperCase() && line.length > 3;
      const startsWithChapterWord = /^((ГЛАВА|РОЗДІЛ)|\d+\.?)/i.test(line);
      const isShort = line.length < 50;

      if ((isAllCaps && isShort) || startsWithChapterWord) {
        chapterIndices.push(i);
      }
    });

    // Если нет заголовков — весь текст одна глава
    if (chapterIndices.length === 0) {
      return {
        title,
        author,
        chapters: [{ title: 'Весь текст', text: rawText }],
      };
    }

    // Формируем главы по найденным индексам
    const chapters = [];
    for (let i = 0; i < chapterIndices.length; i++) {
      const start = chapterIndices[i];
      const end = chapterIndices[i + 1] ?? lines.length;
      const chapterTitle = lines[start];
      const chapterText = lines.slice(start + 1, end).join('\n');
      chapters.push({ title: chapterTitle, text: chapterText });
    }

    return { title, author, chapters };
  }
}
