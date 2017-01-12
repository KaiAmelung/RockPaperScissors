var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var path = require('path');
var admin = require('firebase-admin');
var uid = require('rand-token').uid;
admin.initializeApp({
  credential: admin.credential.cert('competitive-rps-firebase-adminsdk-aqmiv-272672c409.json'),
  databaseURL: 'https://competitive-rps.firebaseio.com'
});
var ref = admin.database().ref('/');
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);
router.use(express.static(path.resolve(__dirname, 'client')));

server.listen(process.env.PORT || 8080, process.env.IP || '0.0.0.0', function(){
  var addr = server.address();
  console.log('Server listening at', addr.address + ':' + addr.port);
});

var rooms = {};

var usersToToken = {};

var tokenToUsers = {};

var socketToToken = {};

io.sockets.on('connection', function(socket) {
	socket.on('disconnect', function(){
		if(socketToToken[socket]!=null){
			var token = socketToToken[socket];
			var user = tokenToUsers[token];
			socketToToken[socket]=null;
			tokenToUsers[token]=null;
			usersToToken[user]=null;
		}
	});
	socket.on('initUser', function(info){
		socketToToken[socket] = info.token;
		usersToToken[info.uid] = info.token;
		tokenToUsers[info.token] = info.uid;
		socket.emit('initSuccess', info.token)
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
        			rooms[vars.room] = {"players": 1, "elo": snap.elo, player1token: vars.token, player1move: "", player2token: "", player2move: "", sockets: [socket, null], gameInterval: null};
        			var nsp = io.of('/'+vars.room);
        			nsp.on('connection', function(socket2){
        				socket2.on('disconnect', function(){
        					rooms[vars.room][players]--;
        					if(rooms[vars.room][players]==0){
        						rooms[vars.room] = null;
        					}
        					else{
        						var pos = rooms[vars.room][sockets].find(socket2);
	        					rooms[vars.room][sockets][pos] = null;
	        					if(pos == 0){
	        						rooms[vars.room][player1token] = "";
	        						rooms[vars.room][player1move] = "";
	        					}
	        					else {
	        						rooms[vars.room][player2token] = "";
	        						rooms[vars.room][player2move] = "";
	        					}
        						clearIntesrval(rooms[vars.room][gameInterval]);
        						rooms[vars.room][gameInterval] = null;
        					}
        					rooms[vars.room][players]--;
        				});
        				socket2.on("r", function(token) {
        					if(rooms[vars.room].players==2){
	        					if(token==rooms[vars.room].player1token){
	        						rooms[vars.room][player1move] = "r";
	        						socket2.emit("moveSuccess");
	        					}
	        					else if(token==rooms[vars.room].player2token){
	        						rooms[vars.room][player2move] = "r";
	        						socket2.emit("moveSuccess");
	        					}
	        					else {
	        						socket2.emit("errorInMove", "There is no player in this room with that token.");
	        					}
	        				}
	        				else {
	        					socket2.emit("errorInMove", "There are not two players in the room yet.");
	        				}
        				});
        				socket2.on("p", function(token) {
        					if(rooms[vars.room].players==2){
	        					if(token==rooms[vars.room].player1token){
	        						rooms[vars.room][player1move] = "p";
	        						socket2.emit("moveSuccess");
	        					}
	        					else if(token==rooms[vars.room].player2token){
	        						rooms[vars.room][player2move] = "p";
	        						socket2.emit("moveSuccess");
	        					}
	        					else {
	        						socket2.emit("errorInMove", "There is no player in this room with that token.");
	        					}
	        				}
	        				else {
	        					socket2.emit("errorInMove", "There are not two players in the room yet.");
	        				}
        				});
        				socket2.on("s", function(token) {
        					if(rooms[vars.room].players==2){
	        					if(token==rooms[vars.room].player1token){
	        						rooms[vars.room][player1move] = "s";
	        						socket2.emit("moveSuccess");
	        					}
	        					else if(token==rooms[vars.room].player2token){
	        						rooms[vars.room][player2move] = "s";
	        						socket2.emit("moveSuccess");
	        					}
	        					else {
	        						socket2.emit("errorInMove", "There is no player in this room with that token.");
	        					}
	        				}
	        				else {
	        					socket2.emit("errorInMove", "There are not two players in the room yet.");
	        				}
        				});
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
        	rooms[vars.room][players]+=1
        	if(rooms[vars.room][players]==1){
        		rooms[vars.room][player1token] = vars.token;
        		rooms[vars.room][sockets][0] = socket;
        	}
        	else {
        		rooms[vars.room][player2token] = vars.token;
        		rooms[vars.room][sockets][1] = socket;
        		startGame(vars.room);
        	}
        	socket.join(vars.room);
        	socket.emit('joinRoomSuccess');
       	}
    });
});
function startGame(room) {
	var secondsLeft = 30;
	var nsp = io.of('/'+room);
	var interval = setInterval(function(){
		if(secondsLeft != 0){
			nsp.emit("timeLeft", secondsLeft);
			secondsLeft--;
		}
		else {
			clearInterval(interval);
			var winner = "";
			if(rooms[room][player1move]=="r"&&rooms[room][player2move]=="s"||rooms[room][player1move]=="s"&&rooms[room][player2move]=="p"||rooms[room][player1move]=="p"&&rooms[room][player2move]=="r")
				winner = rooms[room][player1token];
			else if(rooms[room][player2move]=="r"&&rooms[room][player1move]=="s"||rooms[room][player2move]=="s"&&rooms[room][player1move]=="p"||rooms[room][player2move]=="p"&&rooms[room][player1move]=="r")
				winner = rooms[room][player2token];
			if(winner!="") {
				nsp.emit("winner", winner);
				if(winner == rooms[room][player1token]){
					ref.child('users/'+tokenToUsers[rooms[room][player1token]]).once('value').then(function(snap){
						ref.child('users/'+tokenToUsers[rooms[room][player1token]]).update({
							elo: snap.elo+10
						});
					});
					ref.child('users/'+tokenToUsers[rooms[room][player2token]]).once('value').then(function(snap){
						ref.child('users/'+tokenToUsers[rooms[room][player2token]]).update({
							elo: snap.elo-10
						});
					});
				}
				else {
					ref.child('users/'+tokenToUsers[rooms[room][player1token]]).once('value').then(function(snap){
						ref.child('users/'+tokenToUsers[rooms[room][player1token]]).update({
							elo: snap.elo-10
						});
					});
					ref.child('users/'+tokenToUsers[rooms[room][player2token]]).once('value').then(function(snap){
						ref.child('users/'+tokenToUsers[rooms[room][player2token]]).update({
							elo: snap.elo+10
						});
					});
				}
				setTimeout(function(){
					nsp.emit("endGame");
					for(var i = 0; i<rooms[room][sockets].length; i++)
						rooms[room][sockets][i].leave(room);
					rooms[room] = null;
				}, 5000);
			}
			else {
				socket.emit("tie");
				rooms[room][player1move] = "";
				rooms[room][player2move] = "";
				startGame(room);
			}
		}
	},1000);
	rooms[room][gameInterval] = interval;
}