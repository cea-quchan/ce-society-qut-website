export interface FileUpload {
  name: string;
  data: Buffer;
  size: number;
  mimetype: string;
  encoding: string;
} 