
const net = require('net');

class RobustSeeder {
  constructor(config = {}) {
    this.config = {
      host: config.host || '127.0.0.1', port: 8990,
      username: config.username || 'jcliadmin', password: config.password || 'jclipwd',
      timeout: config.timeout || 15000,
    };
  }

  async run(sequences) {
    const client = new net.Socket();
    client.setTimeout(this.config.timeout);

    return new Promise((resolve, reject) => {
      let buffer = '';
      let authenticated = false;
      let seqIndex = 0;
      let cmdIndex = 0;

      const finish = (err) => {
        client.destroy();
        if (err) reject(err);
        else resolve('Seeding finished');
      }

      client.connect(this.config.port, this.config.host, () => client.write('\n'));

      client.on('data', (data) => {
        const text = data.toString();
        buffer += text;
        console.log(`[JCLI]: ${text.replace(/\r/g, '\\r').replace(/\n/g, '\\n')}`);
        
        if (!authenticated) {
          if (buffer.toLowerCase().includes('username:')) {
            client.write(this.config.username + '\n');
            buffer = '';
          } else if (buffer.toLowerCase().includes('password:')) {
            client.write(this.config.password + '\n');
            buffer = '';
          } else if (buffer.includes('jcli :')) {
            authenticated = true;
            buffer = '';
            executeNext();
          }
        } else {
          // Check if we are at a prompt
          if (buffer.includes('jcli :') || buffer.trim().endsWith('>')) {
            const lastOutput = buffer;
            buffer = '';
            
            // If we are at a manager prompt but the next command is a main command, we might be stuck
            if (lastOutput.trim().endsWith('>') && cmdIndex === 0) {
               console.log('--- Stuck in manager, sending ko ---');
               client.write('ko\n');
               return;
            }

            executeNext();
          }
        }
      });

      const executeNext = () => {
        if (seqIndex < sequences.length) {
          const currentSeq = sequences[seqIndex];
          if (cmdIndex < currentSeq.length) {
            const cmd = currentSeq[cmdIndex++];
            console.log(`Sending: ${cmd} (seq ${seqIndex}, cmd ${cmdIndex-1})`);
            client.write(cmd + '\n');
          } else {
            seqIndex++;
            cmdIndex = 0;
            executeNext();
          }
        } else {
          console.log('Persisting and quitting...');
          client.write('persist\n');
          setTimeout(() => {
            client.write('quit\n');
            finish();
          }, 1000);
        }
      };

      client.on('error', finish);
      client.on('timeout', () => finish(new Error('Timeout')));
    });
  }
}

async function startSeeding() {
  const seeder = new RobustSeeder();
  const sequences = [
    // Cleanup
    ['group -r maxis_group'],
    ['user -r admin_user', 'user -r marketing_user'],
    ['smppccm -r MAXIS_SMPP_01', 'smppccm -r MAXIS_SMPP_02'],
    ['filter -r Filter_Internal', 'filter -r Filter_Marketing', 'filter -r TEST_FILTER'],
    ['mtrouter -r 0', 'mtrouter -r 10'],
    
    // Setup
    ['group -a', 'gid maxis_group', 'ok'],
    ['user -a', 'uid admin_user', 'gid maxis_group', 'username admin', 'password admin_pwd', 'ok'],
    ['user -a', 'uid marketing_user', 'gid maxis_group', 'username marketing', 'password marketing_pwd', 'ok'],
    
    ['smppccm -a', 'cid MAXIS_SMPP_01', 'host 127.0.0.1', 'port 2775', 'username test', 'password test', 'ok'],
    ['smppccm -a', 'cid MAXIS_SMPP_02', 'host 127.0.0.1', 'port 2776', 'username test2', 'password test2', 'ok'],
    
    ['filter -a', 'fid Filter_Internal', 'type UserFilter', 'uid admin_user', 'ok'],
    ['filter -a', 'fid Filter_Marketing', 'type UserFilter', 'uid marketing_user', 'ok'],
    
    ['mtrouter -a', 'type DefaultRoute', 'order 0', 'connector smppc(MAXIS_SMPP_01)', 'rate 0.05', 'ok'],
    ['mtrouter -a', 'type StaticMTRoute', 'order 10', 'filters Filter_Marketing', 'connector smppc(MAXIS_SMPP_02)', 'rate 0.02', 'ok']
  ];

  try {
    await seeder.run(sequences);
    console.log('SUCCESS');
  } catch (e) {
    console.error('FAILED', e);
  }
}

startSeeding();
