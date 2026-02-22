import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { order: 'asc' }
    });
    
    const formatted = routes.map(r => ({
      order: r.order.toString(),
      type: r.direction,
      route_type: r.type,
      rate: r.rate.toFixed(2),
      connectors: r.connectorId || 'None',
      filters: r.filters || 'None',
      id: r.id
    }));
    
    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error('API Error:', error);
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
    const { type, order, route_type, connector, filters, id } = body;
    
    if (!id && (!type || !order)) {
      return NextResponse.json({ error: 'Missing unique identifier' }, { status: 400 });
    }

    const updateData: any = {};
    if (route_type) updateData.type = route_type;
    if (connector) updateData.connectorId = connector;
    if (filters !== undefined) updateData.filters = filters || '';
    if (type) updateData.direction = type;

    if (id) {
       await prisma.route.update({
         where: { id },
         data: updateData
       });
    } else {
       // fallback for older UI where id isn't passed but order and type are
       const existing = await prisma.route.findFirst({
          where: { order: parseInt(order), direction: type }
       });
       if(existing) {
         await prisma.route.update({
           where: { id: existing.id },
           data: updateData
         });
       }
    }
    
    return NextResponse.json({ message: 'Route updated successfully' });
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
    const { type, order, route_type, connector, filters } = body;
    
    if (!type || !order || !route_type || !connector) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.route.create({
      data: {
        order: parseInt(order, 10),
        direction: type,
        type: route_type,
        connectorId: connector,
        filters: filters || '',
        rate: 0.0
      }
    });
    
    return NextResponse.json({ message: 'Route created successfully' });
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
    const order = searchParams.get('order');
    const type = searchParams.get('type');
    
    if (!order || !type) {
      return NextResponse.json({ error: 'Missing order or type' }, { status: 400 });
    }

    const existing = await prisma.route.findFirst({
        where: { order: parseInt(order, 10), direction: type }
    });
    
    if(existing) {
       await prisma.route.delete({
         where: { id: existing.id }
       });
    }
    
    return NextResponse.json({ message: 'Route deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Unable to open the database') || message.includes('code 14') || message.includes('Read-only')) {
      return NextResponse.json({ message: 'Action simulated (Vercel Read-Only Demo)' });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
