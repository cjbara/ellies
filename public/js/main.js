
$(document).ready(function() {
	//Load the firebase script, which has all the API calls
	$.getScript("./js/fire.js", function () {
		console.log("Loaded Firebase Script");
	} );

	$('.kitchen').hide();
	$('#kitchen').hide();
	var showKitchen = false;

	checkLoggedIn();
	checkAdmin();
	showOrders();

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

	//Click to show the account
	$("#cartModalButton").on("click", function() {
		showCart();
		$("#cartModal").modal("show").addClass("fade");
	});

	//Click to show the current orders
	$("#ordersModalButton").on("click", function() {
		showOrders();
		$("#ordersModal").modal("show").addClass("fade");
	});

	//Show the kitchen and hide the menu
	$('#showKitchen').on("click", function() {
		if(showKitchen === true) {
			$('#menu').show();
			$('#kitchen').hide();
			showKitchen = false;
		} else {
			$('#menu').hide();
			$('#kitchen').show();
			showKitchen = true;
		}
	});

	//Creates a new user in Firebase and logs the user in
	$("#registerUser").on("click",function() {
		console.log("Register User");
		var email = $('#regemail').val();
		var firstName = $('#regFirstName').val();
		var lastName = $('#regLastName').val();
		var fisherName = $('#regFisherName').val();
		var room = $('#regroom').val();
		var password = $('#regpassword').val();

		createNewUser(firstName, lastName, fisherName, room, email, password);
		$('#alertNotLoggedIn').fadeOut();
		$("#registerModal").modal("hide");
	} );

	//Logs a user in with credentials
	$('#loginUser').on("click", function() {
		console.log("Login");
		var email = $('#loginemail').val();
		var password = $('#loginpassword').val();

		loginUser(email, password);
		$('#alertNotLoggedIn').fadeOut();
		$("#loginModal").modal("hide");
	} );

	//logs a user out
	$('#logoutbutton').on('click', function() {
		var firebase = new Firebase("https://ellies-deli.firebaseio.com/");
		firebase.unauth();
		//add code for what to do on logout
		fillOutUserData();
		console.log("Logging out");
		$('#alertNotLoggedIn').fadeIn();
		$("#logoutModal").modal("hide");
		$('.kitchen').hide();
		$('#menu').show();
		$('#kitchen').hide();
	} );

	//Add an item to the cart
	$('.addItem').on('click', function() {
		var id = $(this).attr('id');

		switch(id){
			case 'addCheesus':
				console.log("Cheesus to cart");
				addItemToCart("Grilled Cheesus", 2.00);
				break;
			case 'addBroleck':
				console.log("Broleck to cart");
				addItemToCart("The Broleck", 2.00);
				break;
			case 'addNutEllie':
				console.log("NutEllie to cart");
				addItemToCart("Grilled NutEllie", 2.00);
				break;
			case 'addHalm':
				console.log("Halm to cart");
				addItemToCart("The Steamy Halm and Cheese", 2.50);
				break;
			case 'addFrad':
				console.log("Frad to cart");
				addItemToCart("The Frad", 2.50);
				break;
			case 'addDeece':
				console.log("Deece to cart");
				addItemToCart("The Deece", 3.00);
				break;
			case 'addChips':
				console.log("Chips to cart");
				addItemToCart("Chips", 0.75);
				break;
			case 'addIceCream':
				console.log("Ice Cream to cart");
				addItemToCart("Ice Cream Sandwich", 0.75);
				break;
			case 'addGatorade':
				console.log("Gatorade to cart");
				addItemToCart("Gatorade", 1);
				break;
			default:
				console.log("Non selected item");
				break;
		}
	});

	//clear the entire cart
	$('#clearOrder').on('click', function(){
		clearCart();
	});

	//Submit an order
	$('#submitOrder').on('click', function(){
		submitOrder();
	});

	//update an order
	$('div').on('click', '#updatePaid', function() {
		var name = $(this).data('name');
		var yn = $(this).data('yn');
		if(yn === true) { $(this).text("Yes"); }
		else { $(this).text("No"); }
		updatePaid(name, yn);
	});
	$('div').on('click', '#updateStatus', function() {
		var name = $(this).data('name');
		var stat = $(this).data('status');
		var order = $(this).data('order');
		$(this).text(stat);
		updateStatus(name, stat, order);
	});
		
});
