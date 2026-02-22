import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export async function GET() {
  try {
    // Fetch system-wide stats
    const httpStatOutput = await jcli.execute('stats --httpapi');
    const smppStatOutput = await jcli.execute('stats --smppsapi');
    
    return NextResponse.json({
      http: parseStats(httpStatOutput),
      smpp: parseStats(smppStatOutput),
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    
    if (action === 'persist') {
      await jcli.execute('persist');
      return NextResponse.json({ message: 'All configurations persisted successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseStats(output: string) {
  const stats: Record<string, string> = {};
  const lines = output.split('\n');
  
  lines.forEach(line => {
    const parts = line.split(':').map(p => p.trim());
    if (parts.length >= 2) {
      const key = parts[0].toLowerCase().replace(/\s+/g, '_');
      stats[key] = parts.slice(1).join(':');
    }
  });
  
  return stats;
}
