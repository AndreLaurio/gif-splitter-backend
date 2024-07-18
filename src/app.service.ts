import { Injectable } from '@nestjs/common';
import * as Jimp from 'jimp';

@Injectable()
export class AppService {
  async splitGif(filePath: string, rows: number, cols: number): Promise<Buffer[]> {
    try {
      console.log('Reading frames from GIF:', filePath);
      const gif = await Jimp.read(filePath);

      const width = gif.bitmap.width;
      const height = gif.bitmap.height;
      const frameWidth = Math.floor(width / cols); // Adjusted to ensure integer frame dimensions
      const frameHeight = Math.floor(height / rows); // Adjusted to ensure integer frame dimensions

      console.log(`GIF Dimensions: ${width}x${height}, Frame Dimensions: ${frameWidth}x${frameHeight}`);

      const smallGifs: Buffer[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const startX = col * frameWidth;
          const startY = row * frameHeight;

          const smallGif = new Jimp(frameWidth, frameHeight);

          // Copy pixels from the original GIF to the smallGif
          gif.scan(startX, startY, frameWidth, frameHeight, function (x, y, idx) {
            const targetIdx = smallGif.getPixelIndex(x - startX, y - startY);
            smallGif.bitmap.data[targetIdx] = this.bitmap.data[idx];
            smallGif.bitmap.data[targetIdx + 1] = this.bitmap.data[idx + 1];
            smallGif.bitmap.data[targetIdx + 2] = this.bitmap.data[idx + 2];
            smallGif.bitmap.data[targetIdx + 3] = this.bitmap.data[idx + 3];
          });

          const buffer = await smallGif.getBufferAsync(Jimp.MIME_PNG);
          smallGifs.push(buffer);
          console.log(`Finished encoding grid cell (${row}, ${col})`);
        }
      }

      return smallGifs;
    } catch (error) {
      console.error('Error processing GIF:', error);
      throw new Error('Error processing GIF');
    }
  }
}
