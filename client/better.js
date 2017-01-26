
var can=document.getElementById("c");
var d=document.getElementById("screen");
can.width=d.offsetWidth;
can.height=d.offsetHeight;
d.style.display="none";
var ctx=can.getContext('2d');
var paper = new Image();
paper.src = 'betterpaper.png';
var scissors= new Image();
scissors.src = 'betterscissors.png';
var rock = new Image();
rock.src = 'betterrock.png';
/*
var socket = io();
var timeLeft=30
var switching="None"
var config = {
    apiKey: "AIzaSyD0bwuT6hzq-dwMLdCSl7dUau1m92gMlNY",
    authDomain: "competitive-rps.firebaseapp.com",
    databaseURL: "https://competitive-rps.firebaseio.com",
    storageBucket: "competitive-rps.appspot.com",
    messagingSenderId: "673281215044"
  };
firebase.initializeApp(config);

function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

setTimeout(function(){
		if(firebase.auth().currentUser == null || get("room")==null){
			location.href = "rooms.html"
		}
		else{
			firebase.auth().currentUser.getToken(true).then(function(tokeni){
				socket.emit("join", {
					token: tokeni,
					room: get("room")
				});
			});
		}
}, 1000)

socket.on("joinRoomSuccess", function(){
	console.log("successfully joined")
	socket = io('/'+get("room"))
	socket.on('timeLeft', function(updateTime){
		console.log("new time "+updateTime)
	  	timeLeft=updateTime
	});
	socket.on("winner",function(uid){
		if(firebase.auth().currentUser.uid==uid)
		{
			animation("w");
		}
		else
		{
			animation("l");
		}
		setTimeout(function(){
			location.href = "rooms.html"
		}, 5000);
	});
	socket.on("tie",function(){
		animation("t");
	});
	$(".screen").fadeIn()
	loadScreen()
});

socket.on("errorInJoinRoom", function(msg){
	console.log(msg)
	location.href = "rooms.html"
});
*/
function startGame()
{
	load()
	setInterval(function(){
		drawScreen();
	},20)
}

function resizeScreen(){
	can.width=d.offsetWidth;
	can.height=d.offsetHeight;
}
function load()
{
	$("#screen").fadeIn()
}
function drawScreen()
{
	resizeScreen()
	var w = can.width;
	var h = can.height;

	var x=w/7
	var top=h/2-(0.83130081301*(w/7))
	var bottom=h/2+(0.83130081301*(w/7))
	console.log(h/2)
	console.log(bottom)
	console.log(top)
	//x=x+"px"
    ctx.drawImage(paper,5*w/7,top,6*w/7,bottom);
    ctx.drawImage(scissors,3*(w/7),top,4*w/7,bottom);
    ctx.drawImage(rock,w/7,top,2*w/7,bottom);
}
