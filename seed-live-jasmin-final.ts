import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function main() {
  console.log('1. HTTP Client Connectors...');
  const h1 = await client.executeSequence(['httpccm -a', 'cid webhook_dlr', 'url https://webhook.site/receipt', 'method POST', 'ok', 'persist']);
  console.log('H1:', h1[h1.length-2]);

  const h2 = await client.executeSequence(['httpccm -a', 'cid inbound_sms', 'url https://api.mycompany.com/sms', 'method GET', 'ok', 'persist']);
  console.log('H2:', h2[h2.length-2]);

  console.log('\n2. Filters...');
  const f1 = await client.executeSequence(['filter -a', 'type TransparentFilter', 'fid allow_all', 'ok', 'persist']);
  console.log('F1:', f1[f1.length-2]);

  const f2 = await client.executeSequence(['filter -a', 'type UserFilter', 'fid marketing_only', 'uid marketing_api', 'ok', 'persist']);
  console.log('F2:', f2[f2.length-2]);

  console.log('\n3. MO Routes...');
  const r1 = await client.executeSequence(['morouter -a', 'type StaticMORoute', 'filters allow_all', 'connector http(inbound_sms)', 'order 10', 'ok', 'persist']);
  console.log('R1:', r1[r1.length-2]);

  console.log('\n--- Final Verification ---');
  console.log('HTTP Clients:\n', await client.execute('httpccm -l'));
  console.log('Filters:\n', await client.execute('filter -l'));
  console.log('MO Routes:\n', await client.execute('morouter -l'));
}

main();
