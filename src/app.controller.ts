import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseIntPipe,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { AppService } from './app.service';

@Controller('gif')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('gif', { storage: multer.memoryStorage() }))
  async uploadGif(
    @UploadedFile() file: any,
    @Body('rows', ParseIntPipe) rows: number,
    @Body('cols', ParseIntPipe) cols: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filePath = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(filePath, file.buffer);

    try {
      console.log(`Uploaded file saved at ${filePath}`);
      const smallGifs = await this.appService.splitGif(filePath, rows, cols);
      return smallGifs.map((buffer, index) => ({
        id: index,
        data: buffer.toString('base64'),
      }));
    } catch (error) {
      console.error('Error processing upload request:', error);
      throw new InternalServerErrorException('Error processing GIF');
    } finally {
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
      });
    }
  }
}
