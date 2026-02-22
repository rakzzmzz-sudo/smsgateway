import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  return NextResponse.json({ message: 'Connector created successfully' });
}

export async function DELETE(req: Request) {
  return NextResponse.json({ message: 'Connector deleted successfully' });
}

export async function PUT(req: Request) {
  return NextResponse.json({ message: 'Connector updated successfully' });
}

export async function PATCH(req: Request) {
  return NextResponse.json({ message: 'Connector action successful' });
}
