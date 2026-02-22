import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    jasmin_version: '0.10',
    uptime: '1 day 2 hours',
    python_version: 'Mock Data'
  });
}
