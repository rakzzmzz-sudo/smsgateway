import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Singleton PrismaClient to prevent multiple connections during dev reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export let prisma: PrismaClient;

if (process.env.VERCEL) {
  // 1. Vercel's serverless environment is 100% read-only, preventing SQLite from creating -wal locks
  // 2. We must physically copy the static bundled database to Vercel's temporary writable /tmp directory
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const tmpPath = '/tmp/dev.db';

  if (!fs.existsSync(tmpPath)) {
    try {
      fs.copyFileSync(dbPath, tmpPath);
      console.log('Successfully copied SQLite dev.db to Vercel /tmp writable directory.');
    } catch (e) {
      console.error('Failed to copy SQLite dev.db to /tmp', e);
    }
  }

  // 3. Inject the dynamic DATABASE_URL environment variable exclusively for Prisma on Vercel
  process.env.DATABASE_URL = `file:${tmpPath}`;
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
} else {
  // Local Development
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}
