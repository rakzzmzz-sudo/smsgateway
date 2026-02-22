import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function GET() {
  try {
    // Fetch SMPP Client Connectors
    const smppOutput = await jcli.execute('smppccm -l');
    if (smppOutput.includes('Incorrect command')) throw new Error('JCLI Error: Incorrect command smppccm');
    const smppConnectors = parseTable(smppOutput, 'SMPP');
    
    // Fetch HTTP Client Connectors
    const httpOutput = await jcli.execute('httpccm -l');
    if (httpOutput.includes('Incorrect command')) throw new Error('JCLI Error: Incorrect command httpccm');
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
    
    if (!cid || !host || !port || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const commands = [
      'smppccm -a',
      `cid ${cid}`,
      `host ${host}`,
      `port ${port}`,
      `username ${username}`,
      `password ${password}`,
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cid = searchParams.get('cid');
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    }

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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { cid, host, port, username, password } = body;
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    }

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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { cid, action, type } = body; // action: 'start' | 'stop', type: 'SMPP' | 'HTTP'
    
    if (!cid || !action) {
      return NextResponse.json({ error: 'Missing cid or action' }, { status: 400 });
    }

    const connectorType = type || 'SMPP'; // Default to SMPP for backward compatibility
    
    if (connectorType === 'SMPP') {
      const jcliAction = action === 'start' ? '-1' : '-0';
      await jcli.execute(`smppccm ${jcliAction} ${cid}`);
      // Auto-persist changes
      await jcli.execute('persist');
    } else {
      // HTTP connectors in Jasmin 0.11 don't seem to have direct start/stop commands
      // They are usually managed via their configuration ok/persist
      return NextResponse.json({ error: 'HTTP connectors do not support service control' }, { status: 405 });
    }
    
    return NextResponse.json({ message: `Connector ${action}ed successfully` });
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
    // Jasmin table data lines ALWAYS start with #, but NOT with #Total or #Cid
    if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#Cid')) continue;
    
    const cleanLine = line.substring(1).trim();
    if (!cleanLine || cleanLine.toLowerCase().startsWith('incorrect')) continue;
    
    const parts = cleanLine.split(/\s+/);
    
    if (parts.length >= 2) {
      items.push({
        id: parts[0],
        type,
        service_status: parts[1],
        session_status: parts[2] || 'N/A',
      });
    }
  }
  
  return items;
}
