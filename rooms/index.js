var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var admin = require('firebase-admin');
var ref = admin.database().ref('/')
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
	socket.on('signup', function(creds){
		var auth = admin.auth()
		auth.createUserWithEmailAndPassword(creds.email, creds.password).then(function(user){
			ref.child('users/'+user.uid).set({
				email: creds.email,
				elo: 1000
			})
			socket.emit("signUpSuccess", user.uid)
		}, function(err){
			socket.emit("errorInSignup", err.message)
		});
	})
	socket.on('login', function(creds){
		var auth = admin.auth()
		auth.signInWithEmailAndPassword().then(function(user){

		}, function(err){
			
		})
	})
	socket.on('join', function(user) {
        socket.join(room);
    });
}