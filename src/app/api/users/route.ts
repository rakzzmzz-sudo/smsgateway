import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  return NextResponse.json({ message: 'User created successfully' });
}

export async function PUT(req: Request) {
  return NextResponse.json({ message: 'User updated successfully' });
}

export async function DELETE(req: Request) {
  return NextResponse.json({ message: 'User deleted successfully' });
}
