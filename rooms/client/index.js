var selected="None"
var socket = io()
var timeLeft=30
var switching="None"

socket.on('timeLeft', function(updateTime){
  		var timeLeft=updateTime
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
	console.log(imageChange(a))
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
		socket.emit("r")
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
		socket.emit("p")
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
		socket.emit("s")
		s.style="border: 8px solid #458B00;"
		r.style="border: 8px solid red;"
		p.style="border: 8px solid red;"
	}
}