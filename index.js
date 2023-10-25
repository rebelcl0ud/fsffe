const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => { console.log('listening on 3000') })

process.on('SIGINT', () => {
    wss.clients.forEach(function each(client) {
        client.close();
    })
    server.close(() => {
            shutdownDB();
    })
})

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

    db.run(`
        INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    
    `)

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

// database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )       
    `);
});

// helpers
function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

function shutdownDB() {
    getCounts()
    console.log('shutting down db')
    db.close()
}
