import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function test() {
  try {
    const list = await client.execute('user -l');
    console.log('====== CURRENT USERS ======');
    console.log(list);
    
    console.log('\n====== ATTEMPTING TO CREATE USER ======');
    const seq = await client.executeSequence([
      'user -a',
      'uid m_api',
      'gid http_integrations',
      'username m_api',
      'password secret123',
      'ok',
      'persist'
    ]);
    console.log(seq);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
