var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert("competitive-rps-firebase-adminsdk-aqmiv-272672c409.json"),
  databaseURL: "https://competitive-rps.firebaseio.com"
});
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
router.use(express.static(path.resolve(__dirname, 'client')));

server.listen(process.env.PORT || 8080, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

rooms = []

io.sockets.on('connection', function(socket) {
	socket.on('login', function(creds){

	})
	socket.on('join', function(user) {
        socket.join(room);
    });
}