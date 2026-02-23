import { NextResponse } from 'next/server';
import { jcli } from '@/lib/jcli';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Aggregating counts from various components
    
    const usersOutput = await jcli.execute('user -l');
    const userCount = parseTotal(usersOutput, 'Total Users:');
    
    const smppOutput = await jcli.execute('smppccm -l');
    const smppCount = parseTotal(smppOutput, 'Total connectors');
    
    const httpOutput = await jcli.execute('httpccm -l');
    const httpCount = parseTotal(httpOutput, 'Total Httpccs');
    
    const mtOutput = await jcli.execute('mtrouter -l');
    const mtCount = parseTotal(mtOutput, 'Total MT');
    
    return NextResponse.json({
      users: userCount,
      connectors: smppCount + httpCount,
      routes: mtCount,
      status: 'Online'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parseTotal(output: string, marker: string): number {
  const line = output.split('\n').find(l => l.includes(marker));
  if (!line) return 0;
  const match = line.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}
