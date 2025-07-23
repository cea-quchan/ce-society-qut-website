import { File } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from './logger';
import { createReadStream } from 'fs';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { FileUpload } from '@/types/upload';
import { IncomingMessage } from 'http';
import fs from 'fs';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Local storage path for development
const LOCAL_STORAGE_PATH = join(process.cwd(), 'public', 'uploads');

// Ensure local storage directory exists
const ensureLocalStorage = async () => {
  try {
    await mkdir(LOCAL_STORAGE_PATH, { recursive: true });
  } catch (error) {
    logger.error('Failed to create local storage directory', error);
    throw new Error('خطا در ایجاد دایرکتوری ذخیره‌سازی');
  }
};

// Upload file to S3
const uploadToS3 = async (file: File, key: string) => {
  try {
    const fileStream = createReadStream(file.filepath);
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: key,
      Body: fileStream,
      ContentType: file.mimetype || 'application/octet-stream'
    });

    await s3Client.send(command);
    
    return {
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      key
    };
  } catch (error) {
    logger.error('S3 upload error', error);
    throw new Error('خطا در آپلود فایل به S3');
  }
};

// Upload file to local storage
const uploadToLocal = async (file: File, key: string) => {
  try {
    await ensureLocalStorage();
    
    const destination = join(LOCAL_STORAGE_PATH, key);
    await writeFile(destination, createReadStream(file.filepath));
    
    return {
      url: `/uploads/${key}`,
      key
    };
  } catch (error) {
    logger.error('Local upload error', error);
    throw new Error('خطا در آپلود فایل به حافظه محلی');
  }
};

export interface UploadedFile {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  encoding?: string;
  url?: string;
  key?: string;
  bucket?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

export const uploadToStorage = async (file: any): Promise<UploadedFile> => {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const path = `/uploads/${filename}`;
    
    return {
      filename,
      path,
      size: file.size,
      mimetype: file.type,
      encoding: file.encoding,
      url: path,
      key: filename,
      createdAt: new Date(),
      metadata: {
        originalname: file.name,
        fieldname: file.fieldname
      }
    };
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}; 

export async function uploadFile(file: Express.Multer.File): Promise<UploadedFile> {
  const filename = `${Date.now()}-${file.originalname}`;
  const path = `uploads/${filename}`;
  
  await fs.promises.writeFile(path, file.buffer);
  
  return {
    filename,
    path,
    size: file.size,
    mimetype: file.mimetype,
    encoding: file.encoding,
    createdAt: new Date(),
    metadata: {
      originalname: file.originalname,
      fieldname: file.fieldname
    }
  };
} 