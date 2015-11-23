
$(document).ready(function() {
	//Load the firebase script, which has all the API calls
	$.getScript("./js/firebase.js", function () {
		console.log("Loaded Firebase Script");
	} );

	checkLoggedIn();

	//If the user is logged in, give them the option to logout,
	//otherwise, give them the option to log in
	$("#loginModalButton").on("click", function() {
		if(checkLoggedIn()){
			$("#logoutModal").addClass("fade").modal("show");
		} else { 
			$("#loginModal").addClass("fade").modal("show");
		}
	});

	//For new users without an account. They click this to register
	$("#registerbutton").on("click", function() {
		$("#loginModal").removeClass("fade").modal("hide");
		$("#registerModal").modal("show").addClass("fade");
	});

	//Creates a new user in Firebase and logs the user in
	$("#registerUser").on("click",function() {
		console.log("Register User");
		var email = $('#regemail').val();
		var name = $('#regname').val();
		var room = $('#regroom').val();
		var password = $('#regpassword').val();

		createNewUser(name, room, email, password);
		$("#registerModal").modal("hide");
	} );

	//Logs a user in with credentials
	$('#loginUser').on("click", function() {
		console.log("Login");
		var email = $('#loginemail').val();
		var password = $('#loginpassword').val();

		loginUser(email, password);
		$("#loginModal").modal("hide");
	} );

	//logs a user out
	$('#logoutbutton').on('click', function() {
		var firebase = new Firebase("https://ellies-deli.firebaseio.com/");
		firebase.unauth();
		//add code for what to do on logout
		fillOutUserData();
		console.log("Logging out");
		$("#logoutModal").modal("hide");
	} );

		
});
