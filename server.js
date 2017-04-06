const express = require('express');
const SocketServer = require('ws').Server;
const WebSocket = require('ws');
const uuidV4 = require('uuid/v4');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      console.log(data);
      client.send(data);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

wss.on('connection', (ws) => {
  console.log('Client connected');

  // let nextSocketId = 1;

  // const sockets = {};

  // const socketId = nextSocketId;
  // nextSocketId++;

  // sockets[socketId] = {
  //   socket: ws,
  //   first: wss.clients.size === 1
  // };

  // console.log('new connection', socketId);

  ws.on('message', (data) => {
    const dataObject = JSON.parse(data);
    dataObject.id = uuidV4();
    console.log('User ' + dataObject.user + ' with a UUID of ' + dataObject.id + ' said ' + dataObject.message);

    wss.broadcast(JSON.stringify(dataObject));
    // Object.values(sockets)
    //   .find(s => s.first)
    //   .socket
    //   .send(JSON.stringify(dataObject));

  });

  // ws.send('something');

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});