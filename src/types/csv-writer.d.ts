declare module 'csv-writer' {
  interface ObjectCsvWriterOptions {
    path: string;
    header: Array<{ id: string; title: string }>;
  }

  interface ObjectCsvWriter {
    writeRecords(records: any[]): Promise<void>;
  }

  export function createObjectCsvWriter(options: ObjectCsvWriterOptions): ObjectCsvWriter;
} 