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
    $('#searchhits table tbody').on('click', 'td a.linkshowuser', showUserInfo);

	 // When submit button is clicked on search bar
	$('#searchform').validate({submitHandler: showSearch});
    
	// When user clicks upload
	$('#upload').on('click', 'filename', changePicture);
	
	// When submit button is clicked on register page
	$('#register').validate({submitHandler: registerformvalidate});
	
	// When submit button is clicked on login page
	$('#loginsubmit').validate({submitHandler: loginformvalidate});
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
        $('#searchwrapper').hide();

		var userdisplayname = $('#user').text();  //get currently logged in user
		// Get Index of object based on id value
		var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.displayname; }).indexOf(userdisplayname);
		// Get our User Object
		user = userListData[arrayPosition];
		if(user){
			if(user.dogowner){
				$('#requestDogLover').show();
			} else {
				$('#requestDogLover').hide();
			}
		}
    });
}

// Show Search Results
function showSearch(event) {
        var tableContent = '';
        var searchfield = document.getElementById("searchfield").value;
        var searchterm = document.getElementById("searchterm").value;
        var searchURL = '/searchresults?searchterm='+searchterm+'&searchfield='+searchfield;
        console.log(searchURL);
        
        $.getJSON(searchURL, function( data ) {
        //as long as 1 hit is returned, display results
        if (data.hits[0] != null)
        {
            $('#searchhits').show();
            $('#searchnohits').hide();
            // For each item in our JSON, add a table row and cells to the content string
            clearMarkers();
            $.each(data.hits, function(){
                tableContent += '<tr>';
                tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.document.username + '">' + this.document.displayname + '</a></td>';
                tableContent += '<td>' + this.document.email + '</td>';
                tableContent += '</tr>';
                if(document.getElementById('googleMap')){
                    var marker = new google.maps.Marker({
                        map: map,
                        position: {
                            lat: this.document.lat,
                            lng: this.document.lng
                        }
                    });
                    mapMarkers.push(marker);
                }
            });

            // Inject the whole content string into our existing HTML table
            $('#searchwrapper table tbody').html(tableContent);
		}
        else
        {
            // if no hits are returned
            $('#searchhits').hide();
            $('#searchnohits').show();
            $('#searchnohits h3').html("Sorry, We could not find any matches for your search");
            
        }
		//default show userlist
		$('#user').hide(); //takes up space
		$('#photoemail').hide(); //takes up space
		$('#changeusername').hide(); //takes up space
		$('#Commentswrapper').hide();
		$('#userInfo').hide();
		$('#userList').hide();
		$('#editPage').hide();
        $('#requestDogLover').hide();
        $('#searchwrapper').show();
        
		});
};  
// Show User Info
function showUserInfo(event) {
	$.ajax({
		type: 'POST',
		url: '/clickeduser/' + $(this).attr('rel')
	}).done(function( response ) {
		$.getJSON( '/clickeduser', function( data ) {
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
            $('#searchwrapper').hide();
			
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
			
			$.each(thisUserObject.ratings, function(){
			tableContent += '<div class="eachcomment">';
            tableContent += '<div class="panel panel-default">';
			tableContent += '<div class="panel-heading">' + this.author+ '</div>';
			tableContent += '<div class="panel-body">' + '<p><b>Rating:</b> ' + this.rate + '</p> </br>'+ '<p><b>Comment: </b>' + this.comment + '</p></div>';
            tableContent += '</div>';
			tableContent += '</div>';
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
}

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
}

// Go Home
function goHome(event) {
	//default show userlist
    $('#searchwrapper').hide();
	$('#userInfo').hide();
	$('#userList').show();
	$('#editPage').hide();
	populateTable();
	window.location.href = '/'
}

// Log In
function login(event) {

	window.location.href = '/login'
}

// Log out
function logout(event) {
	window.location.href = '/logout'
}

// Register
function register(event) {
	window.location.href = '/register'
}

// Edit User
function editUser() {
    $('#searchwrapper').hide();
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
}

//make admin
function changeAdmin(state) {
	$.ajax({
		type: 'POST',
		url: '/makeadmin/' + thisUserObject._id + '/' + state
	}).done(function( response ) {
		window.location.href = '/';
    });
}

//accept request
function acceptRequest(reqIndex) {
	$.ajax({
		type: 'POST',
		url: '/acceptrequest/' + thisUserObject.email + '/' + reqIndex
	}).done(function( response ) {
		window.location.href = '/';
    });
}

function changePicture() {
    // jQuery AJAX call for JSON
    $.getJSON( '/userclicked', function( data ) {
		// Stick our user data array into a userlist variable in the global object
		userClicked = data;
    });
}

function registerformvalidate(form) {
	var registErrors = $('#registErrors');
	registErrors.hide();
    // Super basic validation - increase errorCount variable if any fields are blank
	var password = $('#password');
	if(password.val() == '' || $('#confirmpassword').val() == '' || $('#username').val() == '' || !$('#location').val()) {
		registErrors.text("One or more fields are blank");
		registErrors.show();
		return;
	}
	var hasNumber = /\d/;
	var hasCapital = /[A-Z]/;
	var hasLower = /[a-z]/;
	var hasAt = /[@]/;

	if(password.val().length < 8){
		registErrors.text("Your password must be at least 8 characters long.");
		registErrors.show();
		return;
	}else if(!hasAt.test($('#username').val())) {
		registErrors.text("Not a valid email. Must have @");
		registErrors.show();
		return;
	}else if(password.val().indexOf($('#username').val())>-1){
		registErrors.text("Your password may not contain your username to better secure your account.");
		registErrors.show();
		return;
	}else if(!hasNumber.test(password.val())){
		registErrors.text("Your password must contain at least one number.");
		registErrors.show();
		return;
	}else if(!hasCapital.test(password.val())){
		registErrors.text("Your password must contain at least one capital letter.");
		registErrors.show();
		return;
	}else if(!hasLower.test(password.val())){
		registErrors.text("Your password must contain at least one lowercase letter.");
		registErrors.show();
		return;
	}

	if(!$('#location').val()){
		registErrors.text('Please enter your location.');
		registErrors.show();
		return;
	}else{
		geocoder.geocode({'address':$('#location').val()},function(results,status){
			if(status == google.maps.GeocoderStatus.OK){
				var result = results[0].geometry.location;
				$(form).prepend('<input type="hidden" name="lat" value="'+ result.lat() +'">');
				$(form).prepend('<input type="hidden" name="lng" value="'+ result.lng() +'">');
			}else{
				registErrors.text("Invalid Address");
				registErrors.show();
				return;
			}
			form.submit();
		})
	}
}

function loginformvalidate(form) {
    // Super basic validation - increase errorCount variable if any fields are blank
	var hasAt = /@/;
	if($('#username').val() == '' || $('#password').val() == '') {
		alert("One or more fields are blank");
		return
	}
	if(!hasAt.test($('#username').val())) {
		alert("not a valid email");
		return
	}
}

function facebookLogin() {
	window.location.href = '/login/facebook';
}