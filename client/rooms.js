var socket = io();
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
			firebase.database().ref("/users/"+firebase.auth().currentUser.uid).once('value').then(function(snap){
				document.getElementById('elo').innerHTML = "ELO: "+snap.val().elo
			});
		}
}, 1000)
socket.on("rooms", function(listRooms){
	var listOfAvailableGames = document.getElementById("games")
	listOfAvailableGames.innerHTML = ""
	for(var i in listRooms){
		var individualRoomTag = document.createElement('LI')
		if(listRooms[i].players==1)
			individualRoomTag.innerHTML = "<a href='better.html?room="+listRooms[i].name+"'>" + listRooms[i].name + " | ELO: " + listRooms[i].elo + " | 1/2</a>"
		else
			individualRoomTag.innerHTML = "<a href='better.html?room="+listRooms[i].name+"'>" + listRooms[i].name + " | 0/2</a>"
		listOfAvailableGames.appendChild(li)
	}
})
socket.on("createRoomSuccess", function(){
	refresh()
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
function create(){
	var name = document.getElementById("creator").value;
	if(name.length!=0 && name.length<9 && name.indexOf(" ")==-1)
		createRoom(name)
	else
		document.getElementById("err").innerHTML = "Invalid room name. Name must be less than 9 characters, and not contain spaces."
}
