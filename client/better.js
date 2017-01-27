var screenInterval = null;
var timeLeft = 10;
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
var w
var h
var circles=[0,0,10,0,0]
var selected=""
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
	  	timeLeft=updateTime
	});
	socket.on("winner",function(uid){
		setTimeout(function(){
			location.href = "rooms.html"
		}, 5000);
	});
	socket.on("win", function(token){
		if(token == firebase.auth().currentUser.uid){
			if(circles[0]==0)
				circles[0]=1
			else if(circles[1]==0)
				circles[1]=1
			else{
				circles[2]=1
				winAnimation(true);
			}
		}
		else {
			if(circles[4]==0)
				circles[4]=-1
			else if(circles[3]==0)
				circles[3]=-1
			else{
				circles[2]=-1
				winAnimation(true);
			}
		}
	})
	socket.on("tie",function(){
		selected = ""
	});
	$("#screen").fadeIn()
	startGame()
});

socket.on("errorInJoinRoom", function(msg){
	console.log(msg)
	location.href = "rooms.html"
});
function winAnimation(winner){

}
function startGame()
{
	load()
	screenInterval = setInterval(function(){
		drawScreen();
	},20)
	can.onmousedown=function(evt){
		x=evt.offsetX;
		y=evt.offsetY;
		var top=h/2-(0.83130081301*(w/7))
		var bottom=h/2+(0.83130081301*(w/7))
		if ((w/7)<=x && x<=(2*w/7) && top<=y && y<=bottom)
		{
			rockClick();
		}
		if ((3*w/7)<=x && x<=(4*w/7) && top<=y && y<=bottom)
		{
			scissorsClick();
		}
		if ((5*w/7)<=x && x<=(6*w/7) && top<=y && y<=bottom)
		{
			paperClick();
		}
	}
}
function rockClick()
{
selected="r"
firebase.auth().currentUser.getToken(true).then(function(tokeni){
	socket.emit("r", tokeni)
});
console.log("rock");
}
function paperClick()
{
selected="p"
firebase.auth().currentUser.getToken(true).then(function(tokeni){
	socket.emit("p", tokeni)
});
console.log("paper");
}
function scissorsClick()
{
selected="s"
firebase.auth().currentUser.getToken(true).then(function(tokeni){
	socket.emit("s", tokeni)
});
console.log("scissors");
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
	w = can.width;
	h = can.height;

	ctx.fillStyle = "#e3e3e3";
	ctx.fillRect(0, 0,w,h);
	var top=h/2-(0.83130081301*(w/7))
	var bottom=(0.83130081301*(w/7)*2)
	var addh=h/16
	var addw=addh/1.66260162602	//x=x+"px"
	if (selected!="p")
    	ctx.drawImage(paper,5*w/7,top,w/7,bottom);
    else
    	ctx.drawImage(paper,5*w/7-(addw/2),top-(addh/2),w/7+addw,bottom+addh)
    if(selected!="s")
    	ctx.drawImage(scissors,3*(w/7),top,w/7,bottom);
    else
    	ctx.drawImage(scissors,3*w/7-(addw/2),top-(addh/2),w/7+addw,bottom+addh)
    if(selected!="r")
    	ctx.drawImage(rock,w/7,top,w/7,bottom);
    else
    	ctx.drawImage(rock,w/7-(addw/2),top-(addh/2),w/7+addw,bottom+addh)
    radius=h/64
    height=h/6
    for (var i=1;i<6;i++)
    {
    	ctx.beginPath();
    	ctx.strokeStyle="#c3c3c3"
    	ctx.lineWidth=3;
    	ctx.arc((i*w/6),height,radius,0,2*Math.PI,false)
    	if (circles[i-1]==0)
    	{
    		ctx.fillStyle="#e3e3e3"
    	}
    	if (circles[i-1]==10)
    	{
    		ctx.fillStyle="#ADD8E6"
    	}
    	if (circles[i-1]==-1)
    	{
    		ctx.fillStyle="#FF716D"
    	}
    	if (circles[i-1]==1)
    	{
			ctx.fillStyle="#90ee90"    		
    	}
    	ctx.fill();
    	ctx.stroke();
    }
    ctx.font = "40px Arial";
    ctx.fillStyle="#000000"
	ctx.fillText(timeLeft,w/2-25, height/2);
}
