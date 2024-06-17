const http = require('http');
const httpProxy = require('http-proxy');

// Cria o proxy
const proxy = httpProxy.createProxyServer({});

// Cria o servidor que vai usar o proxy
const server = http.createServer((req, res) => {
proxy.web(req, res, { target: 'https://github.com' });
});

console.log('Proxy server is running on http://localhost:8000');
server.listen(8000);
