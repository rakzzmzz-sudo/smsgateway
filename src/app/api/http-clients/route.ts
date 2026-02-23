import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const httpOutput = await jcli.execute('httpccm -l');
    if (httpOutput.includes('Incorrect command')) throw new Error('JCLI Error: Incorrect command httpccm');
    const httpConnectors = parseTable(httpOutput);
    
    return NextResponse.json(httpConnectors);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cid, url, method } = body;
    
    if (!cid || !url || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const commands = [
      'httpccm -a',
      `cid ${cid}`,
      `url ${url}`,
      `method ${method}`,
      'ok',
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'HTTP Client Connector created successfully' });
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
      `httpccm -r ${cid}`,
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'HTTP Client Connector deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { cid, url, method } = body;
    
    if (!cid) {
      return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    }

    const commands = [`httpccm -u ${cid}`];
    
    if (url) commands.push(`url ${url}`);
    if (method) commands.push(`method ${method}`);
    
    commands.push('ok');
    commands.push('persist');

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'HTTP Client Connector updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseTable(output: string) {
  const lines = output.split('\n');
  const items = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#Cid') || line.startsWith('#Httpcc')) continue;
    
    const cleanLine = line.substring(1).trim();
    if (!cleanLine || cleanLine.toLowerCase().startsWith('incorrect')) continue;
    
    const parts = cleanLine.split(/\s+/);
    
    if (parts.length >= 2) {
      items.push({
        id: parts[0],
        type: 'HTTP',
        service_status: parts[1] || 'ND',
        session_status: parts[2] || 'N/A',
      });
    }
  }
  
  return items;
}
