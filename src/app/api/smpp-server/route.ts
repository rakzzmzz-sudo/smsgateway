import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.smppUser.findMany();

    // Mock stats generation for Vercel
    const mockStats = {
      submit_sm_count: '1450',
      deliver_sm_count: '1440',
      bind_rx_count: '1',
      bind_tx_count: '0',
      bind_trx_count: users.filter((u: { bound: boolean }) => u.bound).length.toString(),
      connected_count: users.filter((u: { bound: boolean }) => u.bound).length.toString()
    };

    const formattedUsers = users.map((u: { uid: string; groupId: string; bound: boolean }) => ({
      uid: u.uid,
      gid: u.groupId,
      balance: 'ND',
      mt: '0',
      throughput: '0',
      bound_connections: u.bound ? '1' : '0'
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
    const { action, uid, gid, password } = body;
    
    if (!action || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'unbind' || action === 'ban') {
      await prisma.smppUser.update({
        where: { uid },
        data: { bound: false }
      });
      return NextResponse.json({ message: `User ${uid} successfully unbound/banned` });
    } else if (action === 'create') {
      if (!gid || !password) {
        return NextResponse.json({ error: 'Missing required fields for user creation' }, { status: 400 });
      }
      await prisma.smppUser.create({
        data: { uid, groupId: gid, password, bound: true }
      });
      return NextResponse.json({ message: 'User created successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

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

    await prisma.smppUser.update({
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
