import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function main() {
  console.log('1. Creating Group...');
  const groupRes = await client.executeSequence([
    'group -a',
    'gid httpapi',
    'ok',
    'persist'
  ]);
  console.log(groupRes);

  console.log('\n2. Creating Users...');
  const usersRes = await client.executeSequence([
    'user -a',
    'uid marketing_api',
    'gid httpapi',
    'username marketing_api',
    'password secret123',
    'ok',
    
    'user -a',
    'uid otp_service',
    'gid httpapi',
    'username otp_service',
    'password secure456',
    'ok',
    
    'persist'
  ]);
  console.log(usersRes);
}

main();
