import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function GET() {
  try {
    const output = await jcli.execute('filter -l');
    
    // Parse JCLI table output
    // Example: #Fid              Type           Parameters
    //          #filter1          UserFilter     uid=myuser
    
    const lines = output.split('\n');
    const filters = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#Fid')) continue;
      
      const cleanLine = line.substring(1).trim();
      const parts = cleanLine.split(/\s+/);
      
      if (parts.length >= 2) {
        filters.push({
          fid: parts[0],
          type: parts[1],
          parameters: parts.slice(2).join(' ') || 'None',
        });
      }
    }
    
    return NextResponse.json(filters);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { fid, type, uid } = body;
    
    if (!fid) {
      return NextResponse.json({ error: 'Missing filter ID' }, { status: 400 });
    }

    const commands = [`filter -u ${fid}`];
    
    if (type) commands.push(`type ${type}`);
    if (uid) commands.push(`uid ${uid}`);
    
    commands.push('ok');
    commands.push('persist');

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Filter updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fid, type, uid } = body;
    
    if (!fid || !type || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const commands = [
      'filter -a',
      `fid ${fid}`,
      `type ${type}`,
      `uid ${uid}`,
      'ok',
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Filter created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return NextResponse.json({ error: 'Missing filter ID' }, { status: 400 });
    }

    const commands = [
      `filter -r ${fid}`,
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Filter deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
