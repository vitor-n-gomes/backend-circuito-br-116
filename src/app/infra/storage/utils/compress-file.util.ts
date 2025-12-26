import { Jimp, JimpMime } from 'jimp';


/**
 * Compresses an image file buffer using Jimp
 * @param buffer - The file buffer to compress
 * @param mimetype - The MIME type of the file
 * @returns Compressed buffer
 */
export async function compressFile(
  buffer: Buffer,
  mimetype: any
): Promise<Buffer> {
  try {
    const image = await Jimp.read(buffer);

    if (image.width > 1920) {
      image.resize({ w: 1920 });
    }
    
    if (mimetype === JimpMime.jpeg) {
      return await image.getBuffer(mimetype, { quality: 80 });
    }
    
    return await image.getBuffer(mimetype);
  } catch (error) {
    console.error('Error compressing file:', error);
    throw error;
  }
}
