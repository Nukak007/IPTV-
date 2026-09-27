const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && pathname === '/api/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/v1/auth/login') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch (e) {}
      const email = data.email || 'demo@centavo.app';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'success',
        data: {
          token: 'jwt_mock_token_' + Date.now(),
          user: {
            id: 'usr_1',
            name: 'Alex Gonzalez',
            email: email
          }
        }
      }));
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/v1/auth/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      data: {
        id: 'usr_1',
        name: 'Alex Gonzalez',
        email: 'demo@centavo.app'
      }
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'error', message: 'Ruta no encontrada' }));
});

server.listen(PORT, () => {
  console.log(`🚀 auth-service corriendo en http://localhost:${PORT}`);
});
