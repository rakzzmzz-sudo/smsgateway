import net from 'net';

interface JcliConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  timeout?: number;
}

export class JcliClient {
  private config: JcliConfig;
  
  constructor(config: Partial<JcliConfig> = {}) {
    this.config = {
      host: config.host || '127.0.0.1',
      port: config.port || 8990,
      username: config.username || 'jcliadmin',
      password: config.password || 'jclipwd',
      timeout: config.timeout || 5000,
    };
  }

  async execute(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.setTimeout(this.config.timeout!);

      let dataBuffer = '';
      let isAuthenticated = false;
      let step = 0;

      client.connect(this.config.port, this.config.host, () => {
        client.write('\n');
      });

      const finish = (err?: Error, result?: string) => {
        client.destroy();
        if (err) reject(err);
        else resolve(result || '');
      };

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
            client.write(`${command}\n`);
          } else if (currentBuffer.includes('incorrect username/password')) {
             finish(new Error('Authentication failed: Incorrect Username/Password'));
          }
        } else {
          if (dataBuffer.includes('jcli :')) {
            // The output includes the echoed command at the start and the prompt at the end.
            // We want just the result in between.
            let result = dataBuffer.trim();
            // Remove the echoed command (it's the first line)
            const lines = result.split(/\r?\n/);
            if (lines.length > 0 && lines[0].trim() === command.trim()) {
                lines.shift();
            }
            result = lines.join('\n').replace(/jcli :\s*$/, '').trim();
            
            client.write('quit\n');
            finish(undefined, result);
          }
        }
      });

      client.on('error', (err) => {
        finish(err);
      });

      client.on('timeout', () => {
        finish(new Error('Connection timed out'));
      });
    });
  }

  async executeSequence(commands: string[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.setTimeout(this.config.timeout!);

      const results: string[] = [];
      let dataBuffer = '';
      let isAuthenticated = false;
      let step = 0;
      let cmdIndex = 0;

      const finish = (err?: Error) => {
        client.destroy();
        if (err) reject(err);
        else resolve(results);
      };

      client.connect(this.config.port, this.config.host, () => {
        client.write('\n');
      });

      client.on('data', (data) => {
        const text = data.toString();
        dataBuffer += text;

        if (!isAuthenticated) {
          const currentBuffer = dataBuffer.toLowerCase();
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
            sendNext();
          }
        } else {
          // Check for prompt or subcommand prompt
          // Add a small delay for subcommands because Jasmin's python shell drops 
          // fast-piped inputs right after a prompt change.
          if (dataBuffer.includes('jcli :') || dataBuffer.trim().endsWith('>')) {
            results.push(dataBuffer.trim());
            dataBuffer = '';
            setTimeout(sendNext, 100);
          }
        }
      });

      const sendNext = () => {
        if (cmdIndex < commands.length) {
          const command = commands[cmdIndex++];
          client.write(`${command}\n`);
        } else {
          client.write('quit\n');
          finish();
        }
      };

      client.on('error', (err) => finish(err));
      client.on('timeout', () => finish(new Error('Connection timed out')));
    });
  }
}

// Singleton instance for easy importing
export const jcli = new JcliClient();
