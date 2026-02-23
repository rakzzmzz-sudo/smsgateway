import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function main() {
  console.log('Testing HTTP Connector Syntax...');
  console.log(await client.executeSequence(['httpccm -a', 'cid testhttp', 'url http://127.0.0.1/', 'method GET', 'ok']));
  
  console.log('Testing Filter Syntax...');
  console.log(await client.executeSequence(['filter -a', 'type TransparentFilter', 'fid testfilter', 'ok']));
}

main();
