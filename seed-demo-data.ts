import { JcliClient } from './src/lib/jcli';

const client = new JcliClient({
  host: '127.0.0.1',  // Running from host machine against Docker mapped port 8990
  port: 8990,
  username: 'jcliadmin',
  password: 'jclipwd',
  timeout: 10000
});

async function main() {
  console.log('--- COMMENCING ENTERPRISE DEMO SEEDING ---');

  // 1. Groups & Users
  console.log('1. Seeding Groups and 10 API Users...');
  await client.executeSequence(['group -a', 'gid clients_tier1', 'ok']);
  await client.executeSequence(['group -a', 'gid clients_tier2', 'ok']);
  await client.executeSequence(['group -a', 'gid internal_sys', 'ok']);

  const userScenarios = [
    { uid: 'marketing_hq', gid: 'clients_tier1', pass: 'secret1' },
    { uid: 'otp_service', gid: 'internal_sys', pass: 'secret2' },
    { uid: 'alerts_finance', gid: 'clients_tier1', pass: 'secret3' },
    { uid: 'crm_integration', gid: 'clients_tier2', pass: 'secret4' },
    { uid: 'bulk_promo_eu', gid: 'clients_tier1', pass: 'secret5' },
    { uid: 'bulk_promo_apac', gid: 'clients_tier2', pass: 'secret6' },
    { uid: '2fa_global', gid: 'internal_sys', pass: 'secret7' },
    { uid: 'support_desk', gid: 'clients_tier2', pass: 'secret8' },
    { uid: 'logistics_api', gid: 'clients_tier1', pass: 'secret9' },
    { uid: 'healthcare_bot', gid: 'internal_sys', pass: 'secret10' }
  ];

  for (const u of userScenarios) {
    await client.executeSequence([
      'user -a',
      `uid ${u.uid}`,
      `gid ${u.gid}`,
      `username ${u.uid}`,
      `password ${u.pass}`,
      'ok'
    ]);
  }
  await client.execute('persist');
  await client.execute('load');

  // 2. HTTP Client Connectors (Webhooks)
  console.log('2. Seeding 10 HTTP Client Connectors (Webhooks)...');
  const httpScenarios = [
    { cid: 'webhook_dlr_hq', url: 'https://hq.company.com/dlr' },
    { cid: 'webhook_inbound_uk', url: 'https://uk.company.com/sms/in' },
    { cid: 'webhook_inbound_us', url: 'https://us.company.com/sms/in' },
    { cid: 'salesforce_sync', url: 'https://api.salesforce.com/sms/webhook' },
    { cid: 'zendesk_tickets', url: 'https://help.zendesk.com/api/sms' },
    { cid: 'hubspot_crm', url: 'https://api.hubapi.com/sms/events' },
    { cid: 'slack_alerts', url: 'https://hooks.slack.com/services/T00/B00' },
    { cid: 'zapier_catch', url: 'https://hooks.zapier.com/hooks/catch/123' },
    { cid: 'analytics_engine', url: 'https://data.company.com/ingest/sms' },
    { cid: 'legacy_erp', url: 'http://10.0.0.5:8080/sms/receive' }
  ];

  for (const h of httpScenarios) {
    await client.executeSequence([
      'httpccm -a',
      `cid ${h.cid}`,
      `url ${h.url}`,
      'method POST',
      'ok'
    ]);
  }
  await client.execute('persist');
  await client.execute('load');

  // 3. Filters
  console.log('3. Seeding 10 Traffic Filters...');
  const filterScenarios = [
    { fid: 'allow_all', type: 'TransparentFilter' },
    { fid: 'block_spam', type: 'TransparentFilter' }, // Mocking logic
    { fid: 'only_marketing', type: 'UserFilter', uid: 'marketing_hq' },
    { fid: 'only_otp', type: 'UserFilter', uid: 'otp_service' },
    { fid: 'only_finance', type: 'UserFilter', uid: 'alerts_finance' },
    { fid: 'eu_traffic', type: 'UserFilter', uid: 'bulk_promo_eu' },
    { fid: 'apac_traffic', type: 'UserFilter', uid: 'bulk_promo_apac' },
    { fid: 'only_healthcare', type: 'UserFilter', uid: 'healthcare_bot' },
    { fid: 'only_logistics', type: 'UserFilter', uid: 'logistics_api' },
    { fid: 'crm_only', type: 'UserFilter', uid: 'crm_integration' }
  ];

  for (const f of filterScenarios) {
    const seq = ['filter -a', `type ${f.type}`, `fid ${f.fid}`];
    if (f.uid) seq.push(`uid ${f.uid}`);
    seq.push('ok');
    await client.executeSequence(seq);
  }
  await client.execute('persist');
  await client.execute('load');

  // 4. MO Routes
  console.log('4. Seeding 10 MO Routing Scenarios...');
  // We will map filters to http connectors
  for (let i = 0; i < 10; i++) {
    const filter = filterScenarios[i].fid;
    const connector = httpScenarios[i].cid;
    await client.executeSequence([
      'morouter -a',
      'type StaticMORoute',
      `filters ${filter}`,
      `connector http(${connector})`,
      `order ${10 + i}`,
      'ok'
    ]);
  }
  await client.execute('persist');

  console.log('--- SEEDING COMPLETE! ---');
}

main();
