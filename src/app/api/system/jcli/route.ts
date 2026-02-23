import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    
    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }
    
    // Execute the raw string directly against the Hostinger Telnet socket
    const output = await jcli.execute(command);
    
    return NextResponse.json({ result: output });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
