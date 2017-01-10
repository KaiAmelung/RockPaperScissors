var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var admin = require('firebase-admin');
var uid = require('rand-token').uid;
var ref = admin.database().ref('/')
admin.initializeApp({
  credential: admin.credential.cert('competitive-rps-firebase-adminsdk-aqmiv-272672c409.json'),
  databaseURL: 'https://competitive-rps.firebaseio.com'
});
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
router.use(express.static(path.resolve(__dirname, 'client')));

server.listen(process.env.PORT || 8080, process.env.IP || '0.0.0.0', function(){
  var addr = server.address();
  console.log('Server listening at', addr.address + ':' + addr.port);
});

rooms = {};

usersToToken = {};

tokenToUsers = {};

io.sockets.on('connection', function(socket) {
	socket.on('signup', function(creds){
		var auth = admin.auth();
		auth.createUserWithEmailAndPassword(creds.email, creds.password).then(function(user){
			ref.child('users/'+user.uid).set({
				email: creds.email,
				elo: 1000
			});
			var token = uid(16);
			usersToToken[user.uid] = token;
			tokenToUsers[token] = user.uid;
			socket.emit('signUpSuccess', token);
		}, function(err){
			socket.emit('errorInSignup', err.message);
		});
	});
	socket.on('login', function(creds){
		var auth = admin.auth()
		auth.signInWithEmailAndPassword().then(function(user){
			var token = uid(16);
			usersToToken[user.uid] = token;
			tokenToUsers[token] = user.uid;
			socket.emit('loginSuccess', token);
		}, function(err){
			socket.emit('errorInLogin', err.message);
		});
	});
	socket.on('createRoom', function(vars){
		if(tokenToUsers[vars.token]==null)
			socket.emit('errorInCreateRoom', 'There is no user associated with this token.');
		else if(rooms[vars.room]!=null)
        	socket.emit('errorInCreateRoom', 'There is a room already associated with that name.');
        else {
        	ref.child('users/'+tokenToUsers[vars.token]).once('value').then(function(snap){
        		if(!snap.exists())
        			socket.emit('errorInCreateRoom', 'Problem accessing firebase data.');
        		else {
        			rooms[vars.room] = {"players": 1, "elo": snap.elo, player1token: vars.token, player1move: ""}
        			var nsp = io.of('/'+vars.room)
        			nsp.on('connection', function(socket){
        				socket.on("r", token)
        			});
        			socket.join(vars.room);
        			socket.emit('createRoomSuccess');
        		}
        	});
        }
	});
	socket.on('getRooms', function() {
		socket.emit(rooms);
	});
	socket.on('join', function(vars) {
		if(tokenToUsers[vars.token]==null)
			socket.emit('errorInJoinRoom', 'There is no user associated with this token.');
        else if(rooms[vars.room]==null)
        	socket.emit('errorInJoinRoom', 'There is no room associated with that name.');
       	else {
        	rooms[vars.room].players+=1
        	socket.join(vars.room);
        	socket.emit('joinRoomSuccess');
       	}
    });
}