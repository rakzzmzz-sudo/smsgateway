import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function test() {
  console.log('Attempting to connect and run "user -l"...');
  try {
    const result = await client.execute('user -l');
    console.log('Result:');
    console.log(result);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
