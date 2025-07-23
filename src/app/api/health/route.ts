import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  const startTime = Date.now();
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: { status: 'unknown', message: '', duration: 0 },
      memory: { status: 'unknown', message: '', duration: 0 },
      disk: { status: 'unknown', message: '', duration: 0 }
    },
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  let userCount = 0;
  let newsCount = 0;
  let galleryCount = 0;
  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$connect();
    userCount = await prisma.user.count();
    newsCount = await prisma.news.count();
    galleryCount = await prisma.galleryItem.count();
    
    health.checks.database = {
      status: 'healthy',
      message: `Connected - Users: ${userCount}, News: ${newsCount}, Gallery: ${galleryCount}`,
      duration: Date.now() - dbStart
    };
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      message: `Database error: ${error}`,
      duration: Date.now() - dbStart
    };
    health.status = 'unhealthy';
  }

  // Memory check
  const memStart = Date.now();
  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    health.checks.memory = {
      status: 'healthy',
      message: `Memory usage: ${memUsageMB.heapUsed}MB/${memUsageMB.heapTotal}MB`,
      duration: Date.now() - memStart
    };
  } catch (error) {
    health.checks.memory = {
      status: 'unhealthy',
      message: `Memory check error: ${error}`,
      duration: Date.now() - memStart
    };
  }

  // Disk check (simplified)
  const diskStart = Date.now();
  try {
    
    // Check if key directories are accessible
    const dirs = ['src', 'prisma', 'public'];
    const accessibleDirs = dirs.filter(dir => fs.existsSync(dir));
    
    health.checks.disk = {
      status: accessibleDirs.length === dirs.length ? 'healthy' : 'warning',
      message: `File system accessible (${accessibleDirs.length}/${dirs.length} dirs)`,
      duration: Date.now() - diskStart
    };
  } catch (error) {
    health.checks.disk = {
      status: 'unhealthy',
      message: `Disk check error: ${error}`,
      duration: Date.now() - diskStart
    };
  }

  // Calculate summary
  const checks = Object.values(health.checks);
  health.summary = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'healthy').length,
    failed: checks.filter(c => c.status === 'unhealthy').length
  };

  // Overall status
  if (health.summary.failed > 0) {
    health.status = 'unhealthy';
  } else if (checks.some(c => c.status === 'warning')) {
    health.status = 'degraded';
  }

  const totalDuration = Date.now() - startTime;
  
  await prisma.$disconnect();

  return Response.json({
    success: true,
    data: {
      message: `Connected - Users: ${userCount}, News: ${newsCount}, Gallery: ${galleryCount}`,
      userCount,
      newsCount,
      galleryCount
    }
  });
} 