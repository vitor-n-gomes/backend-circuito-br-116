import { Response } from 'express';

export interface ExpressFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  filename?: string;
}

export abstract class IStorageService {
  abstract upload(file: ExpressFile): Promise<ExpressFile | undefined>;
  abstract delete(path: string): Promise<void>;
  abstract sendToClient(path: string, res: Response): Promise<void>;
}
