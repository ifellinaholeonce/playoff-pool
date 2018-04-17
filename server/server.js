const express = require('express');
const SocketServer = require('ws');
const utils = require('./utils.js')

const PORT = process.env.PORT || 3030;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer.Server({ server });

//This will broadcast messages to everyone connected
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === SocketServer.OPEN) {
      let message = {
        type: data.type,
        body: data.body
      }
      client.send(JSON.stringify(message))
    }
  })
}

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  utils.init(ws)
  console.log('Client connected');
  ws.on('message', function incoming(message) {
    message = JSON.parse(message)
    switch (message.type) {
    case "getPlayers":
    break;
    default:
      console.log("Unknown: ", message)
    }
  })

  ws.on('error', (error) => {
    console.log(error);
  })
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});

utils.startServer();
setInterval(async () => {
  let update = await utils.update();
  if (update) {
    console.log("Send Update")
    wss.broadcast(update)
  } else {
    console.log(update)
    console.log("No Update")
  }
}, 1 * 30 * 1000)
