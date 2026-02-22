import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    
    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    if (command.trim().toLowerCase() === 'quit') {
      return NextResponse.json({ error: 'Direct quit command not allowed' }, { status: 400 });
    }

    const result = await jcli.execute(command);
    
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
