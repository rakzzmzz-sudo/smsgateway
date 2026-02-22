
const net = require('net');

class JcliSeeder {
  constructor(config = {}) {
    this.config = {
      host: config.host || '127.0.0.1',
      port: config.port || 8990,
      username: config.username || 'jcliadmin',
      password: config.password || 'jclipwd',
      timeout: config.timeout || 10000,
    };
  }

  async runCommands(commands) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.setTimeout(this.config.timeout);

      let dataBuffer = '';
      let isAuthenticated = false;
      let step = 0;
      let currentCommandIndex = 0;

      const finish = (err, result) => {
        client.destroy();
        if (err) reject(err);
        else resolve(result || 'Done');
      };

      client.connect(this.config.port, this.config.host, () => {
        client.write('\n');
      });

      client.on('data', (data) => {
        const text = data.toString();
        dataBuffer += text;
        const currentBuffer = dataBuffer.toLowerCase();

        if (!isAuthenticated) {
          if (currentBuffer.includes('username:')) {
            if (step === 0) {
              client.write(`${this.config.username}\n`);
              step = 1;
              dataBuffer = '';
            }
          } else if (currentBuffer.includes('password:')) {
            if (step === 1) {
              client.write(`${this.config.password}\n`);
              step = 2;
              dataBuffer = '';
            }
          } else if (currentBuffer.includes('jcli :')) {
            isAuthenticated = true;
            dataBuffer = '';
            this.sendNext(client, commands, currentCommandIndex);
            currentCommandIndex++;
          } else if (currentBuffer.includes('incorrect username/password')) {
            finish(new Error('Authentication failed'), null);
          }
        } else {
          // Check for various prompts
          // Main prompt: jcli :
          // User/Group/etc manager prompts: > or manager names
          if (dataBuffer.includes('jcli :') || dataBuffer.trim().endsWith('>') || dataBuffer.includes('Session ref:')) {
             if (currentCommandIndex < commands.length) {
               this.sendNext(client, commands, currentCommandIndex);
               currentCommandIndex++;
               dataBuffer = '';
             } else {
               client.write('persist\n');
               setTimeout(() => {
                 client.write('quit\n');
                 finish(null, 'Seeding completed');
               }, 1000);
             }
          }
        }
      });

      client.on('error', finish);
      client.on('timeout', () => finish(new Error('Timeout')));
    });
  }

  sendNext(client, commands, index) {
    const cmd = commands[index];
    console.log(`Sending command [${cmd}]`);
    client.write(`${cmd}\n`);
  }
}

async function seed() {
  const seeder = new JcliSeeder();
  const commands = [
    // Create Group
    'group -a',
    'gid maxis_group',
    'ok',
    
    // Create Users
    'user -a',
    'uid admin_user',
    'gid maxis_group',
    'username admin',
    'password admin_pwd',
    'mt_quota 1000',
    'balance 500.0',
    'ok',
    
    'user -a',
    'uid marketing_user',
    'gid maxis_group',
    'username marketing',
    'password marketing_pwd',
    'balance 1000.0',
    'ok',

    // Create SMPP Connector
    'smppccm -a',
    'cid MAXIS_SMPP_01',
    'host 127.0.0.1',
    'port 2775',
    'username test',
    'password test',
    'ok',
    
    'smppccm -a',
    'cid MAXIS_SMPP_02',
    'host 127.0.0.1',
    'port 2776',
    'username test2',
    'password test2',
    'ok',

    // Create Filters
    'filter -a',
    'fid Filter_Internal',
    'type UserFilter',
    'uid admin_user',
    'ok',
    
    'filter -a',
    'fid Filter_Marketing',
    'type UserFilter',
    'uid marketing_user',
    'ok',

    // Create Routes
    'mtrouter -a',
    'type DefaultRoute',
    'order 0',
    'connector smppc(MAXIS_SMPP_01)',
    'rate 0.05',
    'ok',
    
    'mtrouter -a',
    'type StaticMTRoute',
    'order 10',
    'filters Filter_Marketing',
    'connector smppc(MAXIS_SMPP_02)',
    'rate 0.02',
    'ok',

    'persist'
  ];

  try {
    console.log('Starting Maxis Gateway Seeding...');
    const result = await seeder.runCommands(commands);
    console.log(result);
  } catch (e) {
    console.error('Seeding Failed:', e);
  }
}

seed();
