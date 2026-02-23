import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '76.13.211.177',
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function main() {
  console.log('1. Creating HTTP Client Connectors (Webhooks)...');
  await client.executeSequence([
    'httpccm -a',
    'cid webhook_delivery',
    'url http://webhook.site/mysms-receipts',
    'method POST',
    'ok'
  ]);
  await client.executeSequence([
    'httpccm -a',
    'cid incoming_sms_handler',
    'url https://api.mycompany.com/sms/receive',
    'method GET',
    'ok'
  ]);

  console.log('2. Creating Filters...');
  await client.executeSequence([
    'filter -a',
    'type TransparentFilter',
    'fid allow_all_traffic',
    'ok'
  ]);
  await client.executeSequence([
    'filter -a',
    'type UserFilter',
    'fid only_marketing_api',
    'uid marketing_api', // uid we created earlier
    'ok'
  ]);

  console.log('3. Creating MO Routes (Mobile Originated -> Webhook)...');
  const moRouteRes = await client.executeSequence([
    'morouter -a',
    'type StaticMORoute',
    'filter allow_all_traffic',
    'connector http(incoming_sms_handler)',
    'order 10',
    'ok'
  ]);
  console.log(moRouteRes);

  console.log('4. Persisting Configurations');
  await client.execute('persist');
  
  console.log('\\n--- Final States ---');
  console.log(await client.execute('httpccm -l'));
  console.log(await client.execute('filter -l'));
  console.log(await client.execute('morouter -l'));
}

main();
