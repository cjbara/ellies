//Creates a new account, adds to the database, and logs them in
function createNewUser (firstName, lastName, fisherName, room, email, pw){
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
			newData['first'] = firstName;
			newData['last'] = lastName;
			newData['fisher'] = fisherName;
			newData['room'] = room;
			newData['email'] = email;
			newData['admin'] = false;
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
			$('#alertNotLoggedIn').hide();
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
			fillOutUserData(userData);
		}
	} );
}

//Fills out a user's data in the preferences section
function fillOutUserData(userData){
	if(userData){
		$('#userDataName').text(userData.first+" "+userData.last);
		$('#userDataRoom').text(userData.room);
		$('#userDataEmail').text(userData.email);
		if(userData.fisher){
			$('#username').text("Welcome, "+userData.fisher);
			$('#fisherNamePlace').show();
			$('#userDataFisher').text(userData.fisher);
		} else {
			$('#username').text("Welcome, "+userData.first);
			$('#fisherNamePlace').hide();
		}
		if(userData.admin == true){
			$('.kitchen').show();
		} else {
			$('.kitchen').hide();
		}
	} else {
		$('#userDataName').text(" ");
		$('#userDataFisher').text(" ");
		$('#userDataRoom').text(" ");
		$('#userDataEmail').text(" ");
		$('#username').text("Not Logged In");
		$('.kitchen').hide();
	}
}

//checks if a user is logged in
function checkLoggedIn() {
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/");

	//hide all alerts to start
	$('.alert').hide();

	//get user-related attributes
	this.authData = this.firebase.getAuth();
	if(this.authData){ 
		this.user_id = this.authData.uid; 
		getUserData(this.user_id);	
		return authData;
	} else {
		$('#alertNotLoggedIn').show();
		$('#username').text("Not Logged In");
		$('.kitchen').hide();
		$('#menu').show();
		$('#kitchen').hide();
	}
}

//checks if a user is an admin
function checkAdmin() {
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/");

	//get user-related attributes
	this.authData = this.firebase.getAuth();
	if(this.authData){ 
		this.user_id = this.authData.uid; 
		getUserData(this.user_id);	
		showKitchenOrders();
	} else {
		$('#alertNotLoggedIn').show();
		$('#username').text("Not Logged In");
		$('.kitchen').hide();
		$('#menu').show();
		$('#kitchen').hide();
	}
}

//Adds an item from the cart
function addItemToCart(item, price) {
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/users/");
	this.authData = this.firebase.getAuth();
	this.cart = this.firebase.child(this.authData.uid+"/cart/food/");

	//add item to cart
	var cartItem = {};
	cartItem['name'] = item;
	cartItem['price'] = price;
	cartItem['status'] = 'Submitted to kitchen';
	cart.push(cartItem, function() {
		$('#alertAddedItemToCart').fadeIn().delay(2000).fadeOut();
		showCart();
	});
}

//displays the cart in the modal
function showCart() {
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/users/");
	this.authData = this.firebase.getAuth();
	this.cart = this.firebase.child(this.authData.uid+"/cart/food/");
	
	$('#cartBody').text("");

	this.cart.on("value", function(snapshot){
		var total = 0;
		var qty = 0;
		var arr = {};
		snapshot.forEach(function(childSnapshot) {
			var d = childSnapshot.val();
			var price = Number(d.price).toFixed(2);
			total = + total + +(price); 
			qty++;
			if(arr[d.name]){
				arr[d.name].qty++;
			} else {
				arr[d.name] = {};
				arr[d.name].qty = 1;
				arr[d.name].price = price;
			}
		});
		for(key in arr) {
			var price = Number(arr[key].price*arr[key].qty).toFixed(2);
			$('#cartBody').append('<tr><td>'+key+'</td><td>'+arr[key].qty+'</td><td>$'+price+'</td></tr>');
		}
		$('#totalPrice').text('$'+Number(total).toFixed(2));
		this.cartStats = this.cart.parent();
		this.cartStats.update({'price': total});
		this.cartStats.update({'items': qty});
	} );
}

//Clears entire cart for current user
function clearCart() {
	console.log("Clearing cart");
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/users/");
	this.authData = this.firebase.getAuth();
	this.cart = this.firebase.child(this.authData.uid+"/cart/");
	
	this.cart.remove();

	showCart();	
}

//Submits an order
function submitOrder() {
	console.log("Submitting order to kitchen");
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/users/");
	this.authData = this.firebase.getAuth();
	this.cart = this.firebase.child(this.authData.uid+"/cart/");

	this.orders = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/");
	
	//submit order to activeOrders
	this.cart.once('value', function(snapshot) {
		if(!snapshot.child('food').exists()) { return; }
		var flagError = false;
		var order = snapshot.val();
		order.orderedTime = Firebase.ServerValue.TIMESTAMP;
		order.paid = false;
		order.name = this.authData.uid;
		this.orders.push(order, function(error){
			if(error){
				flagError = true;
				console.log(error);
			}
		});
		if(!flagError){
			console.log("Order Placed");
			$("#cartModal").removeClass("fade").modal("hide");
			$('#alertSumbitOrder').fadeIn().delay(2000).fadeOut();
			clearCart();
		}
	});
}

//displays all current orders in modal
function showOrders() {
	this.firebase = new Firebase("https://ellies-deli.firebaseio.com/users/");
	this.authData = this.firebase.getAuth();
	this.orders = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/");
	
	$('#ordersBody').empty();

	this.orders.on("value", function(snapshot){
		$('#ordersBody').empty();
		$('#yourCurrentOrders').empty();
		var data = snapshot;
		var orderNum = 1;
		data.forEach(function(snap) {
			var info = snap.val();
			var name = getNameFromID(info.name);

			var food = snap.child("food");
			food.forEach(function(snapshot){
				realFood = snapshot.val();
				if(info.name === this.authData.uid){
					$('#yourCurrentOrders').append('<tr><td>'+orderNum+'</td><td>'+realFood.name+'</td><td>'+realFood.status+'</td></tr>');
				}
				$('#ordersBody').append('<tr><td>'+orderNum+'</td><td>'+name+'</td><td>'+realFood.name+'</td><td>'+realFood.status+'</td></tr>');
				orderNum++;
				
			});
		});
	});
}

//fills out the kitchen page with the current orders
function showKitchenOrders() {
	this.authData = this.firebase.getAuth();
	this.orders = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/");

	var query = orders.orderByChild("orderedTime");
	query.on("value", function(snapshot) {
		// This will only be called for the last 100 messages
		$('#kitchenOrders').empty();
		var data = snapshot;
		var orderNum = 1;
		data.forEach(function(snap) {
			var info = snap.val()
			var orderNumber = snap.key();
			//convert orderedTime
			var date = timeConverter(info.orderedTime);
			var name = getNameFromID(info.name);
			var paid = (info.paid)? 'Yes' : 'No';

			var food = snap.child("food");
			var firstItem = true;
			food.forEach(function(snapshot){
				var actualFood = snapshot.val();
				$('#kitchenOrders').append('<tr><td>'+orderNum+'</td><td>'+date+'</td><td>'+name+'</td><td>'+actualFood.name+'</td>'+statusText(snapshot, orderNumber)+((firstItem === true)?'<td rowspan="'+info.items+'">'+paidText(snap)+'</td>':' ')+'</tr>');
				orderNum++;
				firstItem = false;
			});
			$('#kitchenOrders').append('<tr class="info"><td>&nbsp</td><td>&nbsp</td><td>&nbsp</td><td>&nbsp</td><td>&nbsp</td><td>&nbsp</td></tr>');
		});
	});
}

//This function updates the db about whether or not an item was paid for
function updatePaid(name, yn){	
	this.updated = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/"+name+"/");
	this.updated.update({paid: yn});

	//Check to see if you can archive the order
	var archive = true;
	this.order = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/"+name+"/");
	this.order.once('value', function(snap){
		var info = snap.val();
		if(info.paid === false) { archive = false; }
		var food = snap.child('food');
		food.forEach(function(snapshot){
			var item = snapshot.val();
			if(item.status !== "Picked up") { archive = false; }
		});
	});
	if(archive === true){
		this.order.once("value", function(snap){
			this.archive = new Firebase("https://ellies-deli.firebaseio.com/archivedOrders/"+name+"/");
			var order = snap.val();
			order.completedTime = Firebase.ServerValue.TIMESTAMP;
			this.archive.set(order);
		});
		this.order.remove();
	} 
}

//This function updates the db about the status
function updateStatus(name, stat, order){	
	this.updated = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/"+order+"/food/"+name+"/");
	this.updated.update({status: stat});

	//check to see if it can be archived
	var archive = true;
	this.order = new Firebase("https://ellies-deli.firebaseio.com/activeOrders/"+order+"/");
	this.order.once('value', function(snap){
		var info = snap.val();
		if(info.paid === false) { archive = false; }
		var food = snap.child('food');
		food.forEach(function(snapshot){
			var item = snapshot.val();
			if(item.status !== "Picked up") { archive = false; }
		});
	});
	if(archive === true){
		this.order.once("value", function(snap){
			this.archive = new Firebase("https://ellies-deli.firebaseio.com/archivedOrders/"+name+"/");
			var order = snap.val();
			order.completedTime = Firebase.ServerValue.TIMESTAMP;
			this.archive.set(order);
		});
		this.order.remove();
	} 
}

//Returns the html for the paid buttons on the kitchen page
function paidText(snapshot){
	var snap = snapshot.val();
	var currentStatus = snap.paid;
	var currentPaid = (snap.paid)? 'Yes' : 'No';
	var paid = '<div class="dropdown"><button class="btn btn-'+((snap.paid)?'success':'danger')+'" dropdown-toggle" type="button" data-toggle="dropdown">'+currentPaid+'&nbsp<span class="caret"></span></button><ul class="dropdown-menu"><li><a id="updatePaid" data-name="'+snapshot.key()+'" data-yn="true">Yes</a></li><li><a id="updatePaid" data-name="'+snapshot.key()+'" data-yn="false">No</a></li></ul></div>';
	return paid;
}

//Returns the html for the status buttons on the kitchen page
function statusText(snapshot, orderNum){
	var snap = snapshot.val();
	var currentStatus = snap.status;
	var color = "default";
	if(currentStatus === "Submitted to kitchen") { color = "primary"; }
	if(currentStatus === "On the grill") { color = "warning"; }
	if(currentStatus === "Ready for pickup") { color = "success"; }
	if(currentStatus === "Picked up") { color = "info"; }
	var stat = '<td><div class="dropdown"><button class="btn btn-'+color+' dropdown-toggle" type="button" data-toggle="dropdown">'+currentStatus+'&nbsp<span class="caret"></span></button><ul class="dropdown-menu"><li><a id="updateStatus" data-name="'+snapshot.key()+'" data-order="'+orderNum+'" data-order="'+orderNum+'" data-status="Submitted to kitchen">Submitted to kitchen</a></li><li><a id="updateStatus" data-name="'+snapshot.key()+'" data-order="'+orderNum+'" data-status="On the grill">On the grill</a></li><li><a id="updateStatus" data-name="'+snapshot.key()+'" data-order="'+orderNum+'" data-status="Ready for pickup">Ready for pickup</a></li><li><a id="updateStatus" data-name="'+snapshot.key()+'" data-order="'+orderNum+'" data-status="Picked up">Picked up</a></li></ul></div></td>';
	return stat;
}

function timeConverter(UNIX_orderedTime){
  var a = new Date(UNIX_orderedTime);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var am = 'AM';
  if(hour === 0){
	hour = 12;
  } else if(hour === 12){
	am = 'PM';
  } else if(hour > 12){
	hour = hour - 12;
	am = 'PM';
  }
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + ' ' + date + ', ' + year + ' ' + hour + ':' + min + ':' + sec + ' ' + am;
  return time;
}

function getNameFromID(uid){
	var ref = new Firebase('https://ellies-deli.firebaseio.com/users/'+uid+'/');
	var name;
	ref.on("value", function(snap){
		var data = snap.val();
		if(data.fisher){
			name = data.fisher + ' (' + data.first + ' ' + data.last +')';
		} else {
			name = data.first + ' ' + data.last;
		}
		return name;
	});
	return name;	
}
		
