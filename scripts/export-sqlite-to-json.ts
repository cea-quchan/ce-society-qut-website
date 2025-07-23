import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();

async function exportTable(table: string, fileName: string) {
  // @ts-expect-error: Dynamic table access for export
  const data = await prisma[table].findMany();
  writeFileSync(fileName, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Exported ${data.length} records from ${table} to ${fileName}`);
}

async function main() {
  await exportTable('user', 'export_user.json');
  await exportTable('news', 'export_news.json');
  await exportTable('galleryItem', 'export_galleryItem.json');
  // Add more tables if needed
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 