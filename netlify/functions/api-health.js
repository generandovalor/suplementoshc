export default async () => new Response(JSON.stringify({ status: 'ok', service: 'ganaclientes-system', timestamp: new Date().toISOString() }), {
  status: 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
});
