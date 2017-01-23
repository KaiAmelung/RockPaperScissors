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

var tokenToRoom = {};

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
	socket.on('login', function(idtoken){
		admin.auth().verifyIdToken(idtoken).then(function(decoded){
			socketToToken[socket]=decoded;
			tokenToUsers[decoded]=decoded.uid;
			usersToToken[decoded.uid]=decoded;
			socket.emit("loginSuccess")
		}).catch(function(error){
			socket.emit("errorInLogin", "Bad token.")
		})
	});
	socket.on('createRoom', function(vars){
		admin.auth().verifyIdToken(vars.token).then(function(decoded){
			rooms[vars.room] = {players: 0, elo: -1, player1token: {}, player1move: "", player2token: {}, player2move: "", sockets: [socket, null], gameInterval: null};
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
						clearInterval(rooms[vars.room][gameInterval]);
						rooms[vars.room][gameInterval] = null;
					}
				});
				socket2.on("r", function(token) {
					admin.auth().verifyIdToken(token).then(function(decoded){
    					if(rooms[vars.room].players==2){
        					if(decoded==rooms[vars.room].player1token){
        						rooms[vars.room][player1move] = "r";
        						socket2.emit("moveSuccess");
        					}
        					else if(decoded==rooms[vars.room].player2token){
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
				});
				socket2.on("p", function(token) {
					admin.auth().verifyIdToken(token).then(function(decoded){
    					if(rooms[vars.room].players==2){
        					if(decoded==rooms[vars.room].player1token){
        						rooms[vars.room][player1move] = "p";
        						socket2.emit("moveSuccess");
        					}
        					else if(decoded==rooms[vars.room].player2token){
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
				});
				socket2.on("s", function(token) {
					admin.auth().verifyIdToken(token).then(function(decoded){
    					if(rooms[vars.room].players==2){
        					if(decoded==rooms[vars.room].player1token){
        						rooms[vars.room][player1move] = "s";
        						socket2.emit("moveSuccess");
        					}
        					else if(decoded==rooms[vars.room].player2token){
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
			});
			socket.join(vars.room);
			socket.emit('createRoomSuccess');
		}).catch(function(error){
			socket.emit("errorInCreateRoom", "Bad token.")
		})
	});
	socket.on('getRooms', function() {
		ret = []
		for(var x in rooms){
			if(rooms[x].players != 2)
				ret.push({name:x, elo: rooms[x].elo})
		}
		socket.emit("rooms", ret);
	});
	socket.on('join', function(vars) {
		admin.auth().verifyIdToken(vars.token).then(function(decoded){
			if(tokenToUsers[decoded]==null)
				socket.emit('errorInJoinRoom', 'There is no user associated with this token.');
	        else if(rooms[vars.room]==null)
	        	socket.emit('errorInJoinRoom', 'There is no room associated with that name.');
	       	else {
	        	rooms[vars.room][players]+=1
	        	if(rooms[vars.room][players]==1){
	        		rooms[vars.room][player1token] = decoded;
	        		rooms[vars.room][sockets][0] = socket;
	        	}
	        	else {
	        		if(rooms[vars.room][player2token]==null){
		        		rooms[vars.room][player2token] = decoded;
		        		rooms[vars.room][sockets][1] = socket;
		        	}
		        	else{
		        		rooms[vars.room][player1token] = decoded;
		        		rooms[vars.room][sockets][0] = socket;
		        	}
	        		startGame(vars.room);
	        	}
	        	socket.join(vars.room);
	        	socket.emit('joinRoomSuccess');
	       	}
	    });
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