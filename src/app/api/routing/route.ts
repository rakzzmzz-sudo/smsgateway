import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function GET() {
  try {
    // Fetch MT Routes
    const mtOutput = await jcli.execute('mtrouter -l');
    const mtRoutes = parseRoutingTable(mtOutput, 'MT');
    
    // Fetch MO Routes
    const moOutput = await jcli.execute('morouter -l');
    const moRoutes = parseRoutingTable(moOutput, 'MO');
    
    return NextResponse.json([...mtRoutes, ...moRoutes]);
  } catch (error: unknown) {
    console.error('API Error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseRoutingTable(output: string, type: 'MT' | 'MO') {
  const lines = output.split('\n');
  const routes = [];
  
  // Example: #Order Type                   Rate       Connector ID(s)                                  Filter(s)
  //          #0     DefaultRoute           0.00       smppc_primary
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#') || line.startsWith('#Total') || line.startsWith('#Order')) continue;
    
    const cleanLine = line.substring(1).trim();
    const parts = cleanLine.split(/\s+/);
    
    if (parts.length >= 2) {
      routes.push({
        order: parts[0],
        type,
        route_type: parts[1],
        rate: parts[2] || '0.00',
        connectors: parts[3] || 'None',
        filters: parts[4] || 'None',
      });
    }
  }
  
  return routes;
}
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { type, order, route_type, connector, filters } = body;
    
    if (!type || !order) {
      return NextResponse.json({ error: 'Missing type or order' }, { status: 400 });
    }

    const cmdBase = type === 'MT' ? 'mtrouter' : 'morouter';
    const commands = [`${cmdBase} -u ${order}`];
    
    if (route_type) commands.push(`type ${route_type}`);
    if (connector) commands.push(`connector ${connector}`);
    if (filters !== undefined) commands.push(`filters ${filters || "None"}`);
    
    commands.push('ok');
    commands.push('persist');

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Route updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, order, route_type, connector, filters } = body;
    
    if (!type || !order || !route_type || !connector) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cmdBase = type === 'MT' ? 'mtrouter' : 'morouter';
    const commands = [
      `${cmdBase} -a`,
      `type ${route_type}`,
      `order ${order}`,
      `connector ${connector}`,
    ];

    if (filters) {
      commands.push(`filters ${filters}`);
    }

    commands.push('ok');
    commands.push('persist');

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Route created successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const order = searchParams.get('order');
    const type = searchParams.get('type');
    
    if (!order || !type) {
      return NextResponse.json({ error: 'Missing order or type' }, { status: 400 });
    }

    const cmdBase = type === 'MT' ? 'mtrouter' : 'morouter';
    const commands = [
      `${cmdBase} -r ${order}`,
      'persist'
    ];

    await jcli.executeSequence(commands);
    
    return NextResponse.json({ message: 'Route deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
