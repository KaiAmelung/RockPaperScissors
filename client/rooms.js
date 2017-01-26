var config = {
    apiKey: "AIzaSyD0bwuT6hzq-dwMLdCSl7dUau1m92gMlNY",
    authDomain: "competitive-rps.firebaseapp.com",
    databaseURL: "https://competitive-rps.firebaseio.com",
    storageBucket: "competitive-rps.appspot.com",
    messagingSenderId: "673281215044"
  };
firebase.initializeApp(config);
setTimeout(function(){
		if(firebase.auth().currentUser == null){
			location.href = "index.html"
		}
		else {
			refresh()
		}
}, 1000)
var socket = io();
socket.on("rooms", function(stuff){
	var ul = document.getElementById("games")
	ul.innerHTML = ""
	for(var i in stuff){
		var li = document.createElement('LI')
		if(stuff[i].players==1)
			li.innerHTML = "<a href='game.html?room="+stuff[i].name+"'>" + stuff[i].name + " | ELO: " + stuff[i].elo + " | 1/2</a>"
		else
			li.innerHTML = "<a href='game.html?room="+stuff[i].name+"'>" + stuff[i].name + " | 0/2</a>"
		ul.appendChild(li)
	}
})
function refresh(){
	socket.emit("getRooms")
}
function createRoom(name){
	firebase.auth().currentUser.getToken(true).then(function(tokeni){
		socket.emit("createRoom", {
			room: name,
			token: tokeni
		})
	}).catch(function(err){
		location.href = "index.html"
	});
}
socket.on("createRoomSuccess", function(){
	refresh()
})
function create(){
	var name = document.getElementById("creator").value;
	if(name.length!=0 && name.length<9 && name.indexOf(" ")==-1)
		createRoom()
	else
		document.getElementById("err").innerHTML = "Invalid room name. Name must be less than 9 characters, and not contain spaces."
}