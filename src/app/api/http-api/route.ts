import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.httpApiUser.findMany();

    // Mock stats generation for Vercel
    const mockStats = {
      rx_sms: '24',
      tx_sms: '18',
      rx_error_sms: '1',
      tx_error_sms: '0',
      connected_clients: users.length.toString(),
      avg_throughput: '1.2 MPS'
    };

    const formattedUsers = users.map(u => ({
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { uid, gid, password } = body;
    
    if (!uid) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    
    const updateData: any = {};
    if (gid) updateData.groupId = gid;
    if (password) updateData.password = password;
    
    await prisma.httpApiUser.update({
      where: { uid },
      data: updateData
    });
    
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
