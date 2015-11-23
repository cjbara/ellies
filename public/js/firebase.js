//Creates a new account, adds to the database, and logs them in
function createNewUser (name, room, email, pw){
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/");
	var userData = {};
	userData['email'] = email;
	userData['password'] = pw;

	this.firebase.createUser(userData, function(error, userData) {
		if (error) {
			console.log("Error creating user:", error);
		} else {
			console.log("Successfully created user account with uid: ", userData.uid);
			this.userRef = new Firebase("https://ellies-deli.firebaseio.com/users/"+userData.uid);

			//Add this user to the database
			var newData = {};
			newData['name'] = name;
			newData['room'] = room;
			newData['email'] = email;
			newData['orders'] = {};
			this.userRef.set(newData);

			loginUser(email, pw);
		}
	} );
}

//Logs a user in and fills out their data on the page
function loginUser(email, pw){
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/");

	var userData = {};
	userData['email'] = email;
	userData['password'] = pw;

	var authData;

	this.firebase.authWithPassword(userData, function(error, data) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			console.log("Authenticated successfully with payload:", data);
			getUserData(data.uid);				
		} 
	} );
}

//Gets a user's data from the database and calls fillOutUserData
function getUserData(id){
	this.userRef = new Firebase("https://ellies-deli.firebaseio.com/users/"+id);
	this.userRef.on("value", function(snapshot){
		if(snapshot){
			var userData = snapshot.val();
			$('#username').text("Logged in as: "+userData.name);
			console.log(userData);
			fillOutUserData(userData);
			console.log("Logged in as: "+userData.name);
		}
	} );
}

//Fills out a user's data in the preferences section
function fillOutUserData(userData){
	if(userData){
		$('#userDataName').text(userData.name);
		$('#userDataRoom').text(userData.room);
		$('#userDataEmail').text(userData.email);
		$('#username').text("Logged in as "+userData.name);
	} else {
		$('#userDataName').text(" ");
		$('#userDataRoom').text(" ");
		$('#userDataEmail').text(" ");
		$('#username').text("Not Logged In");
	}
}

//checks if a user is logged in
function checkLoggedIn() {
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/");

	//get user-related attributes
	this.authData = this.firebase.getAuth();
	if(this.authData){ 
		this.user_id = this.authData.uid; 
		getUserData(this.user_id);	
		return authData;
	} else {
		$('#username').text("Not Logged In");
	}
}

