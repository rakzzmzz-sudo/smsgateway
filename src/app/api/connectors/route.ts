import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    // Fetch both SMPP and HTTP connectors
    const smppOutput = await jcli.execute('smppccm -l');
    const httpOutput = await jcli.execute('httpccm -l');
    
    const smppConnectors = parseTable(smppOutput, 'SMPP');
    const httpConnectors = parseTable(httpOutput, 'HTTP');
    
    return NextResponse.json([...smppConnectors, ...httpConnectors]);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cid, host, port, username, password } = body;
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing required field: cid' }, { status: 400 });
    }

    // Default to SMPP creation since UI only asks for host/port credentials
    const commands = [
      'smppccm -a',
      `cid ${cid}`,
      `host ${host || '127.0.0.1'}`,
      `port ${port || '2775'}`,
      `username ${username || ''}`,
      `password ${password || ''}`,
      'ok',
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Connector created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { cid, host, port, username, password } = body;
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    }

    // Attempting to update SMPP as UI assumes it based on fields
    const commands = [`smppccm -u ${cid}`];
    
    if (host) commands.push(`host ${host}`);
    if (port) commands.push(`port ${port}`);
    if (username) commands.push(`username ${username}`);
    if (password) commands.push(`password ${password}`);
    
    commands.push('ok');
    commands.push('persist');

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Connector updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid');
    // UI doesn't know type, try SMPP then HTTP
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    }

    // Default to SMPP delete for now
    const commands = [
      `smppccm -r ${cid}`,
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Connector deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { cid, action, type } = body;
    
    if (!cid || !action || !type) {
      return NextResponse.json({ error: 'Missing required configuration' }, { status: 400 });
    }

    const commandStr = type === 'HTTP' ? 'httpccm' : 'smppccm';
    const executeAction = action === 'start' ? '1' : '0';

    await jcli.execute(`${commandStr} -${executeAction} ${cid}`);
    
    return NextResponse.json({ message: `Connector ${cid} action ${action} executed` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseTable(output: string, type: 'SMPP' | 'HTTP') {
  const lines = output.split('\n');
  const items = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#Cid') || line.startsWith('#Httpcc') || line.startsWith('#Smppcc')) continue;
    
    const cleanLine = line.substring(1).trim();
    if (!cleanLine || cleanLine.toLowerCase().startsWith('incorrect')) continue;
    
    const parts = cleanLine.split(/\s+/);
    
    if (parts.length >= 2) {
      items.push({
        id: parts[0],
        type,
        service_status: parts[1] || 'ND',
        session_status: parts[2] || 'N/A',
      });
    }
  }
  
  return items;
}
