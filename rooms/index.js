var port = process.env.PORT || 8080;
var io = require('socket.io')();
io.attach(port);
var games = [];
io.on('connection', function(socket){
	if(games.length==0) {
		var room = Math.floor(Math.random(9000))+1000;
		
	}
	else {

	}
});