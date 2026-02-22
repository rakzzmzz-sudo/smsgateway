import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const smppUsers = await prisma.smppUser.count();
    const httpUsers = await prisma.httpApiUser.count();
    const connectors = await prisma.httpClientConnector.count();
    const routes = await prisma.route.count();
    
    return NextResponse.json({
      users: smppUsers + httpUsers,
      connectors: connectors,
      routes: routes,
      status: 'Online'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
