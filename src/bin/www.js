#!/usr/bin/env node

/* 
  Module dependencies
*/

var app = require('../app');
var debug = require('debug')('sweet-pay-api:server');
var http = require('http');

var port = normalizePort(process.env.PORT || 3000);
app.set('port', port)

var server = http.createServer(app);

var listen = server.listen(port)
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(binf + ' requires elevated privileges');
      process.exit(1);
      break;
    default:
      console.error(error);
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('listening on ' + bind)
}