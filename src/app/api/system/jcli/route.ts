import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    return NextResponse.json({
      output: `Mock response for JCLI command: ${command}\nSuccessfully disconnected from Vercel Serverless environment.`,
      status: 'success'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
