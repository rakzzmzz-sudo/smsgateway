import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function main() {
  console.log('\n--- Building Mock External SMPP Connector ---');
  // Just enough to satisfy Jasmin's parser, even if it can't connect right now
  const ccRes = await client.executeSequence([
    'smppccm -a',
    'cid mocksmpp',
    'host simulator.smpp.org',
    'port 2775',
    'username demouser',
    'password demopass',
    'ok'
  ]);
  console.log(ccRes);

  console.log('\n--- Creating Default Route ---');
  const routeRes = await client.executeSequence([
    'mtrouter -a',
    'type DefaultRoute',
    'connector smppc(mocksmpp)',
    'rate 0.0',
    'ok'
  ]);
  console.log(routeRes);

  await client.execute('persist');
  console.log('\nFinal Route List:');
  console.log(await client.execute('mtrouter -l'));
}

main();
