#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import fs from 'fs';

const prisma = new PrismaClient();

interface HealthCheckResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration?: number;
}

class HealthChecker {
  private results: HealthCheckResult[] = [];
  private baseUrl = 'http://localhost:3001';

  async runAllChecks(): Promise<void> {
    console.log('🔍 Starting Health Check...\n');

    // Database checks
    await this.checkDatabaseConnection();
    await this.checkDatabaseTables();
    await this.checkUserTable();
    await this.checkNewsTable();
    await this.checkGalleryTable();

    // API checks
    await this.checkApiHealth();
    await this.checkUsersApi();
    await this.checkNewsApi();
    await this.checkGalleryApi();

    // System checks
    await this.checkFileSystem();
    await this.checkEnvironmentVariables();

    this.printResults();
    await this.cleanup();
  }

  private async checkDatabaseConnection(): Promise<void> {
    const start = Date.now();
    try {
      await prisma.$connect();
      const duration = Date.now() - start;
      this.addResult('Database Connection', 'PASS', `Connected successfully in ${duration}ms`, duration);
    } catch (error) {
      this.addResult('Database Connection', 'FAIL', `Connection failed: ${error}`);
    }
  }

  private async checkDatabaseTables(): Promise<void> {
    const start = Date.now();
    try {
      // Check if tables exist by trying to count records
      const userCount = await prisma.user.count();
      const newsCount = await prisma.news.count();
      const galleryCount = await prisma.galleryItem.count();
      
      const duration = Date.now() - start;
      this.addResult('Database Tables', 'PASS', 
        `Tables accessible - Users: ${userCount}, News: ${newsCount}, Gallery: ${galleryCount}`, 
        duration
      );
    } catch (error) {
      this.addResult('Database Tables', 'FAIL', `Table access failed: ${error}`);
    }
  }

  private async checkUserTable(): Promise<void> {
    const start = Date.now();
    try {
      const users = await prisma.user.findMany({ take: 1 });
      const duration = Date.now() - start;
      this.addResult('User Table', 'PASS', `User table accessible (${users.length} sample records)`, duration);
    } catch (error) {
      this.addResult('User Table', 'FAIL', `User table error: ${error}`);
    }
  }

  private async checkNewsTable(): Promise<void> {
    const start = Date.now();
    try {
      const news = await prisma.news.findMany({ take: 1 });
      const duration = Date.now() - start;
      this.addResult('News Table', 'PASS', `News table accessible (${news.length} sample records)`, duration);
    } catch (error) {
      this.addResult('News Table', 'FAIL', `News table error: ${error}`);
    }
  }

  private async checkGalleryTable(): Promise<void> {
    const start = Date.now();
    try {
      const gallery = await prisma.galleryItem.findMany({ take: 1 });
      const duration = Date.now() - start;
      this.addResult('Gallery Table', 'PASS', `Gallery table accessible (${gallery.length} sample records)`, duration);
    } catch (error) {
      this.addResult('Gallery Table', 'FAIL', `Gallery table error: ${error}`);
    }
  }

  private async checkApiHealth(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const duration = Date.now() - start;
      
      if (response.ok) {
        this.addResult('API Health Endpoint', 'PASS', `API health check passed in ${duration}ms`, duration);
      } else {
        this.addResult('API Health Endpoint', 'FAIL', `API health check failed with status ${response.status}`);
      }
    } catch (error) {
      this.addResult('API Health Endpoint', 'FAIL', `API health check error: ${error}`);
    }
  }

  private async checkUsersApi(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/users`);
      const duration = Date.now() - start;
      
      if (response.ok) {
        this.addResult('Users API', 'PASS', `Users API accessible in ${duration}ms`, duration);
      } else {
        this.addResult('Users API', 'FAIL', `Users API failed with status ${response.status}`);
      }
    } catch (error) {
      this.addResult('Users API', 'FAIL', `Users API error: ${error}`);
    }
  }

  private async checkNewsApi(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/news`);
      const duration = Date.now() - start;
      
      if (response.ok) {
        this.addResult('News API', 'PASS', `News API accessible in ${duration}ms`, duration);
      } else {
        this.addResult('News API', 'FAIL', `News API failed with status ${response.status}`);
      }
    } catch (error) {
      this.addResult('News API', 'FAIL', `News API error: ${error}`);
    }
  }

  private async checkGalleryApi(): Promise<void> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/gallery`);
      const duration = Date.now() - start;
      
      if (response.ok) {
        this.addResult('Gallery API', 'PASS', `Gallery API accessible in ${duration}ms`, duration);
      } else {
        this.addResult('Gallery API', 'FAIL', `Gallery API failed with status ${response.status}`);
      }
    } catch (error) {
      this.addResult('Gallery API', 'FAIL', `Gallery API error: ${error}`);
    }
  }

  private async checkFileSystem(): Promise<void> {
    const start = Date.now();
    try {
      
      // Check if key directories exist
      const dirs = ['src', 'prisma', 'public', 'src/components'];
      const missingDirs = dirs.filter(dir => !fs.existsSync(dir));
      
      const duration = Date.now() - start;
      if (missingDirs.length === 0) {
        this.addResult('File System', 'PASS', `All required directories exist in ${duration}ms`, duration);
      } else {
        this.addResult('File System', 'FAIL', `Missing directories: ${missingDirs.join(', ')}`);
      }
    } catch (error) {
      this.addResult('File System', 'FAIL', `File system check error: ${error}`);
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    const start = Date.now();
    try {
      const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      const duration = Date.now() - start;
      if (missingVars.length === 0) {
        this.addResult('Environment Variables', 'PASS', `All required env vars set in ${duration}ms`, duration);
      } else {
        this.addResult('Environment Variables', 'FAIL', `Missing env vars: ${missingVars.join(', ')}`);
      }
    } catch (error) {
      this.addResult('Environment Variables', 'FAIL', `Env vars check error: ${error}`);
    }
  }

  private addResult(name: string, status: 'PASS' | 'FAIL', message: string, duration?: number): void {
    this.results.push({ name, status, message, duration });
  }

  private printResults(): void {
    console.log('\n📊 Health Check Results:\n');
    
    const passed = this.results.filter(r => r.status === 'PASS');
    const failed = this.results.filter(r => r.status === 'FAIL');
    
    // Print passed checks
    passed.forEach(result => {
      const icon = '✅';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.name}: ${result.message}${duration}`);
    });
    
    // Print failed checks
    failed.forEach(result => {
      const icon = '❌';
      console.log(`${icon} ${result.name}: ${result.message}`);
    });
    
    // Summary
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (failed.length === 0) {
      console.log('\n🎉 All checks passed! System is healthy.');
    } else {
      console.log('\n⚠️  Some checks failed. Please review the issues above.');
    }
  }

  private async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Run health check
async function main() {
  const checker = new HealthChecker();
  await checker.runAllChecks();
}

main().catch(console.error); 