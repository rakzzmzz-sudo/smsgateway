import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const statsOutput = await jcli.execute('stats --httpapi');
    const usersOutput = await jcli.execute('user -l');

    return NextResponse.json({
      stats: parseStats(statsOutput),
      users: parseUsers(usersOutput)
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

export async function PUT(req: Request) {
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

function parseStats(output: string) {
  const stats: Record<string, string> = {};
  const lines = output.split('\n');
  
  lines.forEach(line => {
    const parts = line.split(':').map(p => p.trim());
    if (parts.length >= 2) {
      const key = parts[0].toLowerCase().replace(/\s+/g, '_').replace(/^#/, '');
      stats[key] = parts.slice(1).join(':');
    } else {
       // alternative format `#key value`
       const cleanLine = line.trim();
       if(cleanLine.startsWith('#')) {
         const parts = cleanLine.substring(1).split(/\s+/);
         if(parts.length >= 2) {
            stats[parts[0].toLowerCase()] = parts[1];
         }
       }
    }
  });
  
  return stats;
}

function parseUsers(output: string) {
  const lines = output.split('\n');
  const users = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#Uid')) continue;
    
    const cleanLine = line.substring(1).trim();
    if (!cleanLine || cleanLine.toLowerCase().startsWith('incorrect')) continue;
    
    const parts = cleanLine.split(/\s+/);
    
    if (parts.length >= 4) {
      users.push({
        uid: parts[0],
        gid: parts[1],
        balance: parts[2],
        mt: parts[3],
        throughput: parts[4] || 'ND',
      });
    }
  }
  
  return users;
}
