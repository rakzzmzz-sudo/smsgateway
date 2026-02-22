import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const filters = await prisma.filter.findMany();
    
    const formatted = filters.map(f => ({
      fid: f.fid,
      type: f.type,
      parameters: f.parameter || 'None',
    }));
    
    return NextResponse.json(formatted);
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

    const updateData: any = {};
    if (type) updateData.type = type;
    if (uid) updateData.parameter = uid;

    await prisma.filter.update({
      where: { fid },
      data: updateData
    });
    
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

    await prisma.filter.create({
      data: { fid, type, parameter: uid }
    });
    
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

    await prisma.filter.delete({
      where: { fid }
    });
    
    return NextResponse.json({ message: 'Filter deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
