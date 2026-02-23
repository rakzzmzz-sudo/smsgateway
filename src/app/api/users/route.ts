import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const smppUsers = await prisma.smppUser.findMany();
    
    // Map SmppUser to the MaxisUser interface expected by the frontend
    const users = smppUsers.map((u: { uid: string; groupId: string }) => ({
      uid: u.uid,
      gid: u.groupId,
      username: u.uid, // Using uid as username for simplicity
      balance: 'ND',
      mt_quota: 'Unlimited'
    }));

    return NextResponse.json(users);
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
    
    if (!uid || !gid || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await prisma.smppUser.create({
      data: { uid, groupId: gid, password, bound: false }
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    
    if (!uid) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    
    await prisma.smppUser.delete({
      where: { uid }
    });
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Unable to open the database') || message.includes('code 14') || message.includes('Read-only')) {
      return NextResponse.json({ message: 'Action simulated (Vercel Read-Only Demo)' });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
