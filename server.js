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
      //console.log(data);
      client.send(data);
    }
  });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.

wss.on('connection', (ws) => {
  console.log(`Client connected. We have ${wss.clients.size} client socket(s) open right now.`);

  let returnUsersLoggedIn = {};
  returnUsersLoggedIn = {
    type: 'loggedInUsers',
    count: wss.clients.size
  }

  wss.broadcast(JSON.stringify(returnUsersLoggedIn));

  ws.on('message', (data) => {
    const dataObject = JSON.parse(data);
    let returnMessage = {};
    switch (dataObject.type) {
      case 'postNotification':
         returnMessage = {
          type: 'incomingNotification',
          userA: dataObject.userA,
          userB: dataObject.userB
        }
        break;
      case 'postMessage':
         returnMessage = {
          type: 'incomingMessage',
          id: uuidV4(),
          user: dataObject.user,
          message: dataObject.message,
          usercolor: dataObject.usercolor
        }
        break;
    }
    wss.broadcast(JSON.stringify(returnMessage));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log(`Client connected. We have ${wss.clients.size} client socket(s) open right now.`);
    let returnUsersLoggedIn = {};
    returnUsersLoggedIn = {
      type: 'loggedInUsers',
      count: wss.clients.size
    }
    wss.broadcast(JSON.stringify(returnUsersLoggedIn));
  });
});