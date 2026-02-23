import { JcliClient } from './src/lib/jcli';
const client = new JcliClient({ host: '76.13.211.177', port: 8990, username: 'jcliadmin', password: 'jclipwd', timeout: 10000 });
async function main() {
  console.log(await client.executeSequence(['smppccm -a', 'help', 'ko']));
}
main();
