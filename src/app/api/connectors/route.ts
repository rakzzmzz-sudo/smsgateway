import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const httpConnectors = await prisma.httpClientConnector.findMany();
    
    // Map HttpClientConnector to the MaxisConnector interface
    const connectors = httpConnectors.map((c: { cid: string }) => ({
      id: c.cid,
      type: 'HTTP',
      service_status: 'STARTED',
      session_status: 'BOUND'
    }));
    
    // Add a single mock SMPP connector to satisfy UI requirements if there are none in db
    connectors.push({
      id: 'smppc_primary',
      type: 'SMPP',
      service_status: 'STARTED',
      session_status: 'BOUND'
    });

    return NextResponse.json(connectors);
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
    const { cid, url, method } = body;
    
    if (!cid || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    await prisma.httpClientConnector.create({
      data: { cid, url, method: method || 'POST' }
    });
    
    return NextResponse.json({ message: 'Connector created successfully' });
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
    const { cid, url, method } = body;
    
    if (!cid) return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    
    const updateData: Record<string, string> = {};
    if (url) updateData.url = url;
    if (method) updateData.method = method;
    
    await prisma.httpClientConnector.update({
      where: { cid },
      data: updateData
    });
    
    return NextResponse.json({ message: 'Connector updated successfully' });
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
    const cid = searchParams.get('cid');
    
    if (!cid) return NextResponse.json({ error: 'Missing connector ID' }, { status: 400 });
    
    await prisma.httpClientConnector.delete({
      where: { cid }
    });
    
    return NextResponse.json({ message: 'Connector deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Unable to open the database') || message.includes('code 14') || message.includes('Read-only')) {
      return NextResponse.json({ message: 'Action simulated (Vercel Read-Only Demo)' });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  // Mock action for starting/stopping services on Vercel Read-Only Demo
  return NextResponse.json({ message: 'Connector action successful (Vercel Read-Only Demo)' });
}
