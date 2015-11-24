// Userlist data array for filling in info box
var userListData = [];

//make logged in user and clicked user global
var user;  
var thisUserObject;
var mapMarkers = [];

// DOM Ready =============================================================
$(document).ready(function() {
    // Populate the user table on initial page load
    populateTable();
	// Username link click
	$('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
	
	// When user clicks upload
	$('#upload').on('click', 'filename', changePicture);
	
	// When submit button is clicked on register page
	$('#register').validate({submitHandler: registerformvalidate});
	
	// When submit button is clicked on login page
	$('#loginsubmit').on('click', loginformvalidate);
});

// Functions =============================================================
var clearMarkers = function(){
	for(var i = 0; i < mapMarkers.length; i++){
		mapMarkers[i].setMap(null);
	}
};

// Fill table with data
function populateTable() {
    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/userlist', function( data ) {
		// Stick our user data array into a userlist variable in the global object
		userListData = data;
        // For each item in our JSON, add a table row and cells to the content string
		clearMarkers();
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.displayname + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '</tr>';
			if(document.getElementById('googleMap')){
				var marker = new google.maps.Marker({
					map: map,
					position: {
						lat: this.lat,
						lng: this.lng
					}
				});
				mapMarkers.push(marker);
			}
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
		
		//default show userlist
		$('#user').hide(); //takes up space
		$('#photoemail').hide(); //takes up space
		$('#changeusername').hide(); //takes up space
		$('#Commentswrapper').hide();
		$('#userInfo').hide();
		$('#userList').show();
		$('#editPage').hide();
		var userdisplayname = $('#user').text();  //get currently logged in user
		// Get Index of object based on id value
		var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.displayname; }).indexOf(userdisplayname);
		// Get our User Object
		user = userListData[arrayPosition];
		if(user.dogowner){
			$('#requestDogLover').show();
		} else {
			$('#requestDogLover').hide();
		}
    });
};


// Show User Info
function showUserInfo(event) {
	$.ajax({
		type: 'POST',
		url: '/clickeduser/' + $(this).attr('rel')
	}).done(function( response ) {
		$.getJSON( '/clickeduser', function( data ) {
			console.log(data);
			// Retrieve display name from link rel attribute
			var thisUserName = data.username;
			// Get Index of object based on id value
			var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);
			// Get our User Object
			thisUserObject = userListData[arrayPosition];
			//Populate Info Box		
			//show info hide rest
			$('#userInfo').show();
			$('#Commentswrapper').show();
			$('#userList').hide();
			$('#editPage').hide();
			//start off all hidden
			$('#revokeadmin').hide();
			$('#makeadmin').hide();
			$('#deleteuser').hide();
			$('#edit').hide();
			$('#adminOnly').hide();
			
			$('#commentemail').val(thisUserObject.email);
			$('#authoremail').val(user.username);
			
			var availableRequests = '<div>Available Requests</div>';
			var acceptedRequests = '<div>Accepted Requests</div>';
			$.each(thisUserObject.requests, function(){
			if(this.acceptedby == ""){
				availableRequests += '<div class="eachrequest">';
				availableRequests += '<div>Start Time ' + this.starttime.split("T")[0] + " " + this.starttime.split("T")[1] + '</div>';
				availableRequests += '<div>End Time ' + this.endtime.split("T")[0] + " " + this.endtime.split("T")[1] + '</div>';
				availableRequests += '<input type="button" onclick="acceptRequest(\'' + this._id + '\')" value="accept" />'
				availableRequests += '</div>';
			} else {
				acceptedRequests += '<div class="eachrequest">';
				acceptedRequests += '<div>Start Time ' + this.starttime.split("T")[0] + " " + this.starttime.split("T")[1] + '</div>';
				acceptedRequests += '<div>End Time ' + this.endtime.split("T")[0] + " " + this.endtime.split("T")[1] + '</div>';
				acceptedRequests += '<div>Accepted By: ' + this.acceptedby + '</div>';
				acceptedRequests  += '</div>';			
			}
			});
			$('#Requestslist').html(availableRequests+acceptedRequests);
			
			var tableContent = '';
		
			console.log("ratings[0].author: " + thisUserObject.ratings[0]);
			// console.log("ratings[1].author: " + viewuser.ratings[0].author);
			
			$.each(thisUserObject.ratings, function(){
			tableContent += '<div class="eachcomment">';
            tableContent += '<div class="panel panel-default">';
			tableContent += '<div class="panel-heading">' + this.author+ '</div>';
			tableContent += '<div class="panel-body">' + '<p><b>Rating:</b> ' + this.rate + '</p> </br>'+ '<p><b>Comment: </b>' + this.comment + '</p></div>';
            tableContent += '</div>';
			tableContent += '</div>';
			console.log(this.comment);
			});
        $('#Commentslist').html(tableContent);
			//choose what to be shown based on user type
			if(user.superadmin) {
				$('#adminOnly').show();
				if(thisUserObject.admin)
					$('#revokeadmin').show();
				else {
					$('#makeadmin').show();
				}
				$('#deleteuser').show();
				$('#edit').show();
			} else if(user.admin) {
				$('#adminOnly').show();
				if(!thisUserObject.admin) {
					$('#deleteuser').show();
					$('#edit').show();
				} else if(user._id == thisUserObject._id) 
					$('#edit').show();
			} else if(user.username == thisUserObject.username)
				$('#edit').show();
			$('#userDisplayName').text(thisUserObject.displayname);
			$('#userEmail').text(thisUserObject.email);
			$('#userDescription').text(thisUserObject.description);
			$('#pageViews').text(thisUserObject.pageviews);
			$('#ipAddress').text(thisUserObject.ipaddr);
			$('#location').text(thisUserObject.location);
			$('#viewingDevice').text(thisUserObject.device);
			if(thisUserObject.profilepicture)
				$('#profilepicture').attr("src", '/file/' + thisUserObject.profilepicture);
			$.ajax({
				type: 'POST',
				url: '/increasepagecount/' + thisUserObject._id + '/' + thisUserObject.pageviews
			});
		});
    });
};

// Delete User
function deleteUser() {
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');
    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/deleteuser/' + thisUserObject._id
        }).done(function( response ) {
            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }
			//go back home
            window.location.href = '/'
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
};

// Go Home
function goHome(event) {
	//default show userlist
	$('#userInfo').hide();
	$('#userList').show();
	$('#editPage').hide();
	populateTable();
	window.location.href = '/'
};

// Log In
function login(event) {

	window.location.href = '/login'
};

// Log out
function logout(event) {
	window.location.href = '/logout'
};

// Register
function register(event) {
	window.location.href = '/register'
};

// Edit User
function editUser() {
	$('#userInfo').hide();
	$('#userList').hide();
	$('#editPage').show();
	$('#email').val(thisUserObject.email);
	//needed to tell photo upload which user to update
	$('#photoemail').val(thisUserObject.email);
	$('#username').val(thisUserObject.email);
	$('#changeusername').val(thisUserObject.email);
	$('#displayname').val(thisUserObject.displayname);
	$('#description').val(thisUserObject.description);
	if(thisUserObject.profilepicture)
		$('#profilepicturesection').attr("src", '/file/' + thisUserObject.profilepicture);
};

//make admin
function changeAdmin(state) {
	$.ajax({
		type: 'POST',
		url: '/makeadmin/' + thisUserObject._id + '/' + state
	}).done(function( response ) {
		window.location.href = '/';
    });
};

//accept request
function acceptRequest(reqIndex) {
	console.log(reqIndex);
	$.ajax({
		type: 'POST',
		url: '/acceptrequest/' + thisUserObject.email + '/' + reqIndex
	}).done(function( response ) {
		window.location.href = '/';
    });
};

function changePicture() {
    // jQuery AJAX call for JSON
    $.getJSON( '/userclicked', function( data ) {
		// Stick our user data array into a userlist variable in the global object
		userClicked = data;
		console.log(data);
    });
	console.log("changing pic");
	//$('#profilepicture').src(user.);
}

function registerformvalidate(form) {
    // Super basic validation - increase errorCount variable if any fields are blank
	var password = $('#password');
	console.log(password.val() == '');
	if(password.val() == '' || $('#confirmpassword').val() == '' || $('#username').val() == '') {
		alert("One or more fields are blank");
		return;
	}
	//check if password equals confirm password
	if(password.val() != $('#confirmpassword').val()){
		alert("The Passwords do not match");
		return;
	}
	var hasNumber = /\d/;
	var hasCapital = /[A-Z]/;
	var hasLower = /[a-z]/;

	if(password.val().length < 8){
		alert("Your password must be at least 8 characters long.");
		return;
	}else if(password.val().indexOf($('#username').val())>-1){
		alert("Your password may not contain your username to better secure your account.");
		return;
	}else if(!hasNumber.test(password.val())){
		alert("Your password must contain at least one number.");
		return;
	}else if(!hasCapital.test(password.val())){
		alert("Your password must contain at least one capital letter.");
		return;
	}else if(!hasLower.test(password.val())){
		alert("Your password must contain at least one lowercase letter.");
		return;
	}

	if(!$('#location').val()){
		alert('Please enter your location.');
		return;
	}else{
		geocoder.geocode({'address':$('#location').val()},function(results,status){
			if(status == google.maps.GeocoderStatus.OK){
				var result = results[0].geometry.location;
				$(form).prepend('<input type="hidden" name="lat" value="'+ result.lat() +'">');
				$(form).prepend('<input type="hidden" name="lng" value="'+ result.lng() +'">');
			}else{
				alert("Invalid Address");
				return;
			}
			form.submit();
		})
	}
}

function loginformvalidate() {
    // Super basic validation - increase errorCount variable if any fields are blank
	console.log($('#password').val() == '');
	if($('#email').val() == '' || $('#password').val() == '') {
		alert("One or more fields are blank");
	}
	if(!$('#email').val().includes('@')) {
		alert("not a valid email");
	}
}