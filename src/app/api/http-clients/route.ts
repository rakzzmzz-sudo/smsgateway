import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const connectors = await prisma.httpClientConnector.findMany();
    
    const formatted = connectors.map(c => ({
      id: c.cid,
      type: 'HTTP',
      service_status: 'STARTED',
      session_status: 'BOUND',
      url: c.url,
      method: c.method
    }));
    
    return NextResponse.json(formatted);
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

    await prisma.httpClientConnector.create({
      data: { cid, url, method }
    });
    
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

    await prisma.httpClientConnector.delete({
      where: { cid }
    });
    
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

    const updateData: any = {};
    if (url) updateData.url = url;
    if (method) updateData.method = method;

    await prisma.httpClientConnector.update({
      where: { cid },
      data: updateData
    });
    
    return NextResponse.json({ message: 'HTTP Client Connector updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
