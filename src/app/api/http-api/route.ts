import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.httpApiUser.findMany();

    // Mock stats generation for Vercel
    const mockStats = {
      request_count: '1542',
      success_count: '1520',
      auth_error_count: '20',
      route_error_count: '2',
      server_error_count: '0'
    };

    const formattedUsers = users.map((u: { uid: string; groupId: string }) => ({
      uid: u.uid,
      gid: u.groupId,
      balance: 'ND',
      mt: '0',
      throughput: '0'
    }));

    return NextResponse.json({
      stats: mockStats,
      users: formattedUsers
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Unable to open the database') || message.includes('code 14') || message.includes('Read-only')) {
      return NextResponse.json({ message: 'Action simulated (Vercel Read-Only Demo)' });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, gid, username, password } = body;
    
    if (!uid || !gid || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields for user creation' }, { status: 400 });
    }
    
    await prisma.httpApiUser.create({
      data: { uid, groupId: gid, password }
    });
    
    return NextResponse.json({ message: 'User created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Unable to open the database') || message.includes('code 14') || message.includes('Read-only')) {
      return NextResponse.json({ message: 'Action simulated (Vercel Read-Only Demo)' });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uid, gid, password } = body;
    
    if (!uid) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    
    const updateData: Record<string, string> = {};
    if (gid) updateData.groupId = gid;
    if (password) updateData.password = password;
    
    await prisma.httpApiUser.update({
      where: { uid },
      data: updateData
    });
    
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Unable to open the database') || message.includes('code 14') || message.includes('Read-only')) {
      return NextResponse.json({ message: 'Action simulated (Vercel Read-Only Demo)' });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
