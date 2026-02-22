import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Database...');

  // 1. HTTP Client Connectors
  await prisma.httpClientConnector.createMany({
    data: [
      { cid: 'dlr_webhook_main', url: 'https://webhooks.example.com/api/dlr', method: 'POST' },
      { cid: 'mo_webhook_inbox', url: 'https://services.example.com/inbox', method: 'POST' },
      { cid: 'legacy_crm_sync', url: 'http://10.0.1.55/crm/intake', method: 'GET' },
      { cid: 'billing_events', url: 'https://finance.example.com/sms/charge', method: 'POST' },
      { cid: 'test_endpoint_dev', url: 'http://localhost:8080/sms', method: 'POST' },
    ],
  });

  // 2. SMPP Users
  await prisma.smppUser.createMany({
    data: [
      { uid: 'client_test_1', password: 'pwd', groupId: 'customers', bound: true },
      { uid: 'aggregator_hk', password: 'secure_pwd1', groupId: 'partners', bound: true },
      { uid: 'bank_alerts_prod', password: 'bank_pwd123', groupId: 'financial', bound: false },
      { uid: 'marketing_bulk', password: 'bulk_123', groupId: 'marketing', bound: true },
      { uid: 'legacy_app_1', password: 'old_sys_pwd', groupId: 'internal', bound: false },
    ],
  });

  // 3. HTTP API Users
  await prisma.httpApiUser.createMany({
    data: [
      { uid: 'web_portal_1', password: 'portal_pwd', groupId: 'web' },
      { uid: 'mobile_app_ios', password: 'ios_pwd', groupId: 'mobile' },
      { uid: 'marketing_bot', password: 'bot_pwd', groupId: 'automation' },
      { uid: 'internal_monitor', password: 'monitor_pwd', groupId: 'internal' },
      { uid: 'partner_api_test', password: 'test_pwd', groupId: 'partners' },
    ],
  });

  // 4. Filters
  await prisma.filter.createMany({
    data: [
      { fid: 'route_celcom', type: 'DestinationAddrFilter', parameter: '^\\+6019' },
      { fid: 'route_maxis', type: 'DestinationAddrFilter', parameter: '^\\+6012' },
      { fid: 'bank_sms_only', type: 'UserFilter', parameter: 'bank_alerts_prod' },
      { fid: 'marketing_sender', type: 'SourceAddrFilter', parameter: 'PROMO_RM' },
      { fid: 'route_digi', type: 'DestinationAddrFilter', parameter: '^\\+6016' },
    ],
  });

  // 5. Routes
  await prisma.route.createMany({
    data: [
      { order: 0, type: 'DefaultRoute', direction: 'MT', connectorId: 'smppc(maxis_out)', filters: '', rate: 0.0 },
      { order: 10, type: 'StaticMTRoute', direction: 'MT', connectorId: 'smppc(celcom_out)', filters: 'route_celcom', rate: 0.5 },
      { order: 20, type: 'StaticMTRoute', direction: 'MT', connectorId: 'smppc(maxis_out)', filters: 'route_maxis', rate: 0.5 },
      { order: 30, type: 'StaticMTRoute', direction: 'MT', connectorId: 'smppc(digi_out)', filters: 'route_digi', rate: 0.5 },
      { order: 10, type: 'StaticMORoute', direction: 'MO', connectorId: 'http(mo_webhook_inbox)', filters: '', rate: 0.0 },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
