const express = require('express');
const dotenv = require('dotenv');
const httpProxy = require('http-proxy');

dotenv.config();

const corePath = process.env.CORE_PATH;
const PORT = process.env.PROXY_PORT;

const app = express();
const proxy = httpProxy.createProxy();


if (!corePath) {
    console.error(`[ERROR] Missing ENV Variables: CORE_PATH`);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`[INFO] Reverse Proxy on: ${PORT}`);
});


app.use((req, res) => {
    const hostName = req.hostname;
    const subDomain = hostName.split('.')[0];
    const proxyTo = `${corePath}/${subDomain}`;

    console.log(`[INFO] Proxy To: ${proxyTo}`);

    proxy.web(req, res, { target: proxyTo, changeOrigin: true }, (err) => {
        console.error(`[ERROR] Proxy Error: ${err.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    });
});

proxy.on('proxyRes', (proxyRes, req, res) => {
    const url = req.url
    if(url === ''){
        proxyRes.path += '/index.html'
    }
})