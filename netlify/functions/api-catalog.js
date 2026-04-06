export default async (request, context) => {
  const gasUrl = process.env.GAS_DEPLOY_URL;
  if (!gasUrl) {
    return new Response(JSON.stringify({ error: 'Missing GAS_DEPLOY_URL' }), { status: 500, headers: jsonHeaders() });
  }

  const endpoint = new URL(gasUrl);
  endpoint.searchParams.set('action', 'all');

  try {
    const upstream = await fetch(endpoint.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...jsonHeaders(),
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=300, stale-while-revalidate=86400',
        'Cache-Control': 'public, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Catalog proxy failed', details: error.message }), { status: 500, headers: jsonHeaders() });
  }
};

function jsonHeaders() {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  };
}
