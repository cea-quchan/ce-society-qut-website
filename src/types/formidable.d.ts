import { IncomingMessage } from 'http';

declare namespace formidable {
  interface File {
    size: number;
    path: string;
    name: string;
    type: string;
    lastModifiedDate?: Date;
    hash?: string;
  }

  interface Fields {
    [key: string]: string | string[];
  }

  interface Files {
    [key: string]: File | File[];
  }

  interface Options {
    encoding?: string;
    uploadDir?: string;
    keepExtensions?: boolean;
    maxFileSize?: number;
    maxFieldsSize?: number;
    maxFields?: number;
    hash?: boolean | string;
    multiples?: boolean;
  }

  interface Formidable {
    parse: (req: any, callback: (err: Error | null, fields: Fields, files: Files) => void) => void;
  }

  function formidable(options?: Options): Formidable;
}

declare module 'formidable' {
  export interface File {
    size: number;
    filepath: string;
    originalFilename: string;
    mimetype: string;
    hash?: string;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface Options {
    encoding?: string;
    uploadDir?: string;
    keepExtensions?: boolean;
    maxFileSize?: number;
    maxFiles?: number;
    filter?: (part: { mimetype?: string }) => boolean;
  }

  export default function formidable(options?: Options): {
    parse: (
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ) => void;
  };
} 