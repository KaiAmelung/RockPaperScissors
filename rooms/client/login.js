var config = {
    apiKey: "AIzaSyD0bwuT6hzq-dwMLdCSl7dUau1m92gMlNY",
    authDomain: "competitive-rps.firebaseapp.com",
    databaseURL: "https://competitive-rps.firebaseio.com",
    storageBucket: "competitive-rps.appspot.com",
    messagingSenderId: "673281215044"
  };
firebase.initializeApp(config);
if(firebase.auth().currentUser != null){
	location.href = "rooms.html"
}
function login(){
	firebase.auth().signInWithEmailAndPassword(document.getElementById("user").value, document.getElementById("pass").value).then(function(user){
		document.getElementById("result").innerHTML = "User signed in"
		location.href = "rooms.html"
	}, function(err){
		document.getElementById("result").innerHTML = "Couldn't sign in user"
	});
}
function signup(){
	firebase.auth().createUserWithEmailAndPassword(document.getElementById("user").value, document.getElementById("pass").value).then(function(user){
		document.getElementById("result").innerHTML = "User created"
		location.href = "rooms.html"
	}, function(err){
		console.log(err)
		document.getElementById("result").innerHTML = "Couldn't create user"
	});
}