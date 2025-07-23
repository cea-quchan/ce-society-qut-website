import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanupDuplicates() {
  // Clean up userId+articleId
  const articleDuplicates = await prisma.like.groupBy({
    by: ['userId', 'articleId'],
    _count: { id: true },
    where: { articleId: { not: null } },
    having: { id: { _count: { gt: 1 } } }
  });
  for (const dup of articleDuplicates) {
    const likes = await prisma.like.findMany({
      where: { userId: dup.userId, articleId: dup.articleId },
      orderBy: { createdAt: 'asc' }
    });
    for (let i = 1; i < likes.length; i++) {
      await prisma.like.delete({ where: { id: likes[i].id } });
    }
  }

  // Clean up userId+eventId
  const eventDuplicates = await prisma.like.groupBy({
    by: ['userId', 'eventId'],
    _count: { id: true },
    where: { eventId: { not: null } },
    having: { id: { _count: { gt: 1 } } }
  });
  for (const dup of eventDuplicates) {
    const likes = await prisma.like.findMany({
      where: { userId: dup.userId, eventId: dup.eventId },
      orderBy: { createdAt: 'asc' }
    });
    for (let i = 1; i < likes.length; i++) {
      await prisma.like.delete({ where: { id: likes[i].id } });
    }
  }

  console.log('Duplicate likes cleaned up!');
}

cleanupDuplicates().finally(() => prisma.$disconnect()); 