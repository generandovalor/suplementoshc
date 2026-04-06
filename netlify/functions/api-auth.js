export default async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders() });
  }

  const payload = await request.json().catch(() => ({}));
  const code = String(payload.code || '').trim();
  const expected = String(process.env.WHOLESALE_ACCESS_CODE || '').trim();

  if (!expected) {
    return new Response(JSON.stringify({ error: 'WHOLESALE_ACCESS_CODE is not configured' }), { status: 500, headers: jsonHeaders() });
  }

  return new Response(JSON.stringify({ valid: code !== '' && code === expected }), { status: 200, headers: jsonHeaders() });
};

function jsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  };
}
