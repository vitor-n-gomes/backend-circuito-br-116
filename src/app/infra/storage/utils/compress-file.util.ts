/**
 * Placeholder for image compression (returns buffer as-is)
 * TODO: Install sharp for production use: npm install sharp
 * @param buffer - The file buffer
 * @param mimetype - The MIME type of the file
 * @returns Original buffer (compression disabled)
 */
export async function compressFile(
  buffer: Buffer,
  mimetype: string
): Promise<Buffer> {
  // Compression is disabled - return buffer as-is
  // To enable compression, install sharp: npm install sharp
  // and implement compression logic here
  console.warn('Image compression is disabled - using original file');
  return buffer;
}
