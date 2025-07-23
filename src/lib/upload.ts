import { NextApiRequest } from 'next';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger';

export const uploadDir = path.join(process.cwd(), 'public/uploads');

export async function handleFileUpload(req: NextApiRequest): Promise<string> {
  try {
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const form = new formidable.IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    return new Promise((resolve, reject) => {
      form.parse(req, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        if (err) {
          logger.error('File upload error', err, req);
          reject(err);
          return;
        }

        // اگر files آرایه است، باید یکی را انتخاب کنید یا حلقه بزنید
        const file = Array.isArray(files) ? files[0] : files;
        if (!file) {
          reject(new Error('No file uploaded'));
          return;
        }

        // Generate unique filename
        const ext = path.extname(file.originalFilename || file.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
        const newPath = path.join(uploadDir, filename);

        try {
          await fs.rename(file.filepath || file.path, newPath);
          logger.info(`File uploaded successfully: ${filename}`, req);
          resolve(`/uploads/${filename}`);
        } catch (error) {
          logger.error('Error saving uploaded file', error, req);
          reject(error);
        }
      });
    });
  } catch (error) {
    logger.error('File upload error', error, req);
    throw error;
  }
} 