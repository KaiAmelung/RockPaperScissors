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
			console.log(firebase.auth().currentUser)
			location.href = "index.html"
		}
}, 1000)
var socket = io();
socket.on("rooms", function(stuff){
	var ul = document.getElementById("games")
	for(var i in stuff){
		var li = document.createElement('LI')
		li.innerHTML = stuff[i].name + " | ELO: " + stuff[i].elo
		ul.appendChild(li)
	}
})
function refresh(){
	socket.emit("getRooms")
}
function createRoom(name){
	firebase.auth().currentUser.getToken(true).then(function(tokeni){
		console.log(tokeni)
		socket.emit("createRoom", {
			room: name,
			token: tokeni
		})
	}).catch(function(err){
		location.href = "index.html"
	})
}