export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const syncUrl = process.env.GAS_DEPLOY_URL;
  const adminToken = process.env.GAS_ADMIN_TOKEN;
  if (!syncUrl || !adminToken) {
    return new Response(JSON.stringify({ error: 'Missing GAS_DEPLOY_URL or GAS_ADMIN_TOKEN' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const payload = await request.json().catch(() => ({}));
  const response = await fetch(syncUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'syncCatalog',
      type: payload.type || 'all',
      adminToken
    })
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
