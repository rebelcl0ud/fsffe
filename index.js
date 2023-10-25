const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => { console.log('listening on 3000') })

// websockets
const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ server: server })

wss.on('connection', function connection(ws) {
    const numClients = wss.clients.size;
    console.log('clients connected', numClients)

    wss.broadcast(`current visitors: ${numClients}`);

    if(ws.readyState === ws.OPEN) {
        ws.send('connection open')
    }

    ws.on('close', function close() {
        wss.broadcast(`current visitors: ${numClients}`);
        console.log('client disconnected');
    })
})

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    })
}
