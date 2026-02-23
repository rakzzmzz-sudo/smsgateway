import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function GET() {
  try {
    const statsOutput = await jcli.execute('stats --smppsapi');
    const usersOutput = await jcli.execute('user -l');
    const userStatsOutput = await jcli.execute('stats --users');

    return NextResponse.json({
      stats: parseStats(statsOutput),
      users: parseUsers(usersOutput, parseUserStats(userStatsOutput))
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, uid, gid, username, password } = body;
    
    if (!action || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (action === 'unbind') {
      await jcli.execute(`user --smpp-unbind=${uid}`);
      return NextResponse.json({ message: `User ${uid} successfully unbound` });
    } else if (action === 'ban') {
      await jcli.execute(`user --smpp-ban=${uid}`);
      return NextResponse.json({ message: `User ${uid} successfully banned` });
    } else if (action === 'create') {
      if (!gid || !username || !password) {
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
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

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
    const cleanLine = line.trim();
    if(cleanLine.startsWith('#')) {
      const parts = cleanLine.substring(1).split(/\s+/);
      if(parts.length >= 2) {
        stats[parts[0].toLowerCase()] = parts[1];
      }
    }
  });
  
  return stats;
}

function parseUserStats(output: string) {
  const stats: Record<string, string> = {};
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#User')) continue;
    
    const cleanLine = line.substring(1).trim();
    if (!cleanLine || cleanLine.toLowerCase().startsWith('incorrect')) continue;
    
    const parts = cleanLine.split(/\s+/);
    if (parts.length >= 2) {
      stats[parts[0]] = parts[1]; // Map UID to SMPP Bound connections
    }
  }
  
  return stats;
}

function parseUsers(output: string, userStats: Record<string, string>) {
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
        bound_connections: userStats[parts[0]] || '0'
      });
    }
  }
  
  return users;
}
