var selected="None"
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
	$(".all").fadeIn()
});

socket.on("errorInJoinRoom", function(msg){
	console.log(msg)
	location.href = "rooms.html"
});



window.onload=function(){
	setInterval(function(){change()},250);
}

function animation(a)
{
	console.log(selected)
	if (selected=="r")
		document.getElementById("outputYou").innerHTML = "<img src='rock.png'>"
	if (selected=="p")
		document.getElementById("outputYou").innerHTML = "<img src='paper.png'>"
	if (selected=="s")
		document.getElementById("outputYou").innerHTML = "<img src='scissors.png'>"
	if (selected=="None")
		document.getElementById("outputYou").innerHTML = "<p>Much Wows, Such Empty</p>"
	document.getElementById("outputEnemy").innerHTML = imageChange(a)
	$(".Box").fadeOut();
	$(".OBox").fadeOut();
	$(".all").fadeOut();
	setTimeout(function(){secondPhase(a)},500)
}
function imageChange(a)
{
you=document.getElementById("outputYou").innerHTML;
console.log(you)
if (a=="w")
{
	if (you == '<img src="rock.png">')
	{
		return "<img src='scissors.png'>"
	}
	if (you == '<img src="paper.png">')
	{
		return "<img src='rock.png'>"
	}
	if (you == '<img src="scissors.png">')
	{
		return "<img src='paper.png'>"
	}
}
if (a=="l")
{
	if (you == '<img src="rock.png">')
	{
		return "<img src='paper.png'>"
	}
	if (you == '<img src="paper.png">')
	{
		return "<img src='scissors.png'>"
	}
	if (you == '<img src="scissors.png">')
	{
		return "<img src='rock.png>"
	}
}
if(a=="t")
{
	return you
}
else
{
	return "<p>Won By Default</p>"
}
}
function secondPhase(a)
{
	console.log("Second");
	$(".BoxHidden").fadeIn();
	$(".OBoxHidden").fadeIn();
	if (a=="w")
		win()
	if (a=="l")
		lose()
	if (a=="t")
		tie()
	setTimeout(function(){thirdPhase()},1000)
}
function thirdPhase()
{
	$(".win").fadeIn();
	$(".all").fadeOut();
}
function win()
{
	document.getElementById("winMessage").innerHTML="You Won!";
}
function lose()
{
	document.getElementById("winMessage").innerHTML="You Lost!";
}
function tie()
{
	document.getElementById("winMessage").innerHTML="Draw!";
	setTimeout(function(){reset1()},1000)

}
function reset1()
{
	$(".win").fadeOut();
	$(".BoxHidden").fadeOut();
	$(".OBoxHidden").fadeOut();
	setTimeout(function(){reset2()},300)
}
function reset2()
{
	document.getElementById("winMessage").innerHTML="";
	$(".all").fadeIn();
	$(".Box").fadeIn();
	$(".OBox").fadeIn();
}
function change()
{
	document.getElementById("outputTimer").innerHTML=timeLeft
	if(switching=="None")
	{
		switching="r"
		s1.style="border: 8px solid red;"
		p1.style="border: 8px solid red;"
		r1.style="border: 8px solid #458B00;"
	}
	else
	{
		if (switching=="r")
		{
			switching="p"
			s1.style="border: 8px solid red;"
			p1.style="border: 8px solid red;"
			r1.style="border: 8px solid #458B00;"
		}
		else 
		{
			if (switching=="p")
			{
				switching="s"
				s1.style="border: 8px solid red;"
				p1.style="border: 8px solid #458B00;"
				r1.style="border: 8px solid red;"
			}
			else
			{
				switching="r"
				s1.style="border: 8px solid #458B00;"
				p1.style="border: 8px solid red;"
				r1.style="border: 8px solid red;"
			}
		}
	}
}
function rock()
{
	if (selected!="r")
	{
		selected="r"
		firebase.auth().currentUser.getToken(true).then(function(tokeni){
			socket.emit("r", tokeni)
		});
		s.style="border: 8px solid red;"
		p.style="border: 8px solid red;"
		r.style="border: 8px solid #458B00;"
	}
}
function paper()
{
	if (selected!="p")
	{
		selected="p"
		firebase.auth().currentUser.getToken(true).then(function(tokeni){
			socket.emit("p", tokeni)
		});
		s.style="border: 8px solid red;"
		p.style="border: 8px solid #458B00;"
		r.style="border: 8px solid red;"
	}
}
function scissors()
{
	if (selected!="s")
	{
		selected="s"
		firebase.auth().currentUser.getToken(true).then(function(tokeni){
			socket.emit("s", tokeni)
		});
		s.style="border: 8px solid #458B00;"
		r.style="border: 8px solid red;"
		p.style="border: 8px solid red;"
	}
}