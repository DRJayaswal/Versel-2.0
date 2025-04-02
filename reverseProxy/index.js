const express = require('express');
const dotenv = require('dotenv');
const httpProxy = require('http-proxy');

dotenv.config();

const app = express();
const PORT = 8000;
const proxy = httpProxy.createProxy();

const corePath = process.env.CORE_PATH;

if (!corePath) {
    console.error(`[ERROR] Missing ENV Variables: CORE_PATH`);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`[INFO] Reverse Proxy on: ${PORT}`);
});
proxy.on('proxyReq', (proxyReq,req, res) => {
    const url = req.url
    if(url === '/'){
        proxyReq.path += 'index.html'
    }
})

app.use((req, res) => {
    const hostName = req.hostname;
    const subDomain = hostName.split('.')[0];
    const proxyTo = `${corePath}/${subDomain}`;

    console.log(`[INFO] Incoming request: Method=${req.method}, URL=${req.url}, HostName=${hostName}, SubDomain=${subDomain}, ProxyTo=${proxyTo}`);

    proxy.web(req, res, { target: proxyTo, changeOrigin: true }, (err) => {
        console.error(`[ERROR] Proxy Error: ${err.message}, Method=${req.method}, URL=${req.url}, HostName=${hostName}, SubDomain=${subDomain}, ProxyTo=${proxyTo}`);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});
