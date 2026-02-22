import { NextRequest, NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function GET() {
  try {
    const output = await jcli.execute('user -l');
    
    // Parse JCLI table output
    // Example:
    // #User id          Group id          Username          Balance           MT quota          
    // #user1            group1            user1             100.0             ND                
    // #Total Users: 1
    
    const lines = output.split('\n');
    const users = [];
    
    // Skip the header (line starting with #User id)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#User id')) continue;
      
      const cleanLine = line.substring(1).trim();
      const parts = cleanLine.split(/\s+/);
      
      if (parts.length >= 4) {
        users.push({
          uid: parts[0],
          gid: parts[1],
          username: parts[2],
          balance: parts[3],
          mt_quota: parts[4] || 'ND'
        });
      }
    }
    
    return NextResponse.json(users);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, gid, username, password } = body;
    
    if (!uid || !gid || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const commands = [
      'user -a',
      `uid ${uid}`,
      `gid ${gid}`,
      `username ${username}`,
      `password ${password}`,
      'ok',
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'User created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, gid, username, password } = body;
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const commands = [`user -u ${uid}`];
    
    if (gid) commands.push(`gid ${gid}`);
    if (username) commands.push(`username ${username}`);
    if (password) commands.push(`password ${password}`);
    
    commands.push('ok');
    commands.push('persist');

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const commands = [
      `user -r ${uid}`,
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
