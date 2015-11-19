// Userlist data array for filling in info box
var userListData = [];

//make logged in user and clicked user global
var user;  
var thisUserObject;

// DOM Ready =============================================================
$(document).ready(function() {
    // Populate the user table on initial page load
    populateTable();
	
	// Username link click
	$('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
	
	// When user clicks upload
	$('#upload').on('click', 'filename', changePicture);
	
	// When submit button is clicked on register page
	$('#submitbutton').on('click', registerformvalidate);
	
	// When submit button is clicked on login page
	$('#loginsubmit').on('click', loginformvalidate);
});

// Functions =============================================================

// Fill table with data
function populateTable() {
    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/userlist', function( data ) {
		// Stick our user data array into a userlist variable in the global object
		userListData = data;
        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.displayname + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
		
		//default show userlist
		$('#user').hide(); //takes up space
		$('#photoemail').hide(); //takes up space
		$('#changeusername').hide(); //takes up space
		$('#userInfo').hide();
		$('#userList').show();
		$('#editPage').hide();
		var userdisplayname = $('#user').text();  //get currently logged in user
		// Get Index of object based on id value
		var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.displayname; }).indexOf(userdisplayname);
		// Get our User Object
		user = userListData[arrayPosition];
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
			$('#userList').hide();
			$('#editPage').hide();
			//start off all hidden
			$('#revokeadmin').hide();
			$('#makeadmin').hide();
			$('#deleteuser').hide();
			$('#edit').hide();
			$('#adminOnly').hide();
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

// create new user
function createUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });
	
	//check if password equals confirm password
	if($('#addUser fieldset input#inputUserPassword').val() != $('#addUser fieldset input#inputUserConfirmPassword').val()){
		alert("The Passwords do not match");
		// Clear the form inputs
		$('#addUser fieldset input').val('');
	}

    // Check and make sure errorCount's still at zero
    else if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'password': $('#addUser fieldset input#inputUserPassword').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {
				window.location.href = '/users'
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// update a User
function updateUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'displayname': $('#addUser fieldset input#inputUserDisplayName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'password': $('#addUser fieldset input#inputUserPassword').val(),
            'description': $('#addUser fieldset input#inputUserDescription').val(),
            'profilepicture': $('#addUser fieldset input#inputUserProfilePicture').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
s
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
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
	console.log(state);
	$.ajax({
		type: 'POST',
		url: '/makeadmin/' + thisUserObject._id + '/' + state
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

function registerformvalidate() {
    // Super basic validation - increase errorCount variable if any fields are blank
	console.log($('#password').val() == '');
	if($('#password').val() == '' || $('#confirmpassword').val() == '' || $('#username').val() == '')
		alert("One or more fields are blank");
	//check if password equals confirm password
	if($('#password').val() != $('#confirmpassword').val()){
		alert("The Passwords do not match");
	}
}

function loginformvalidate() {
    // Super basic validation - increase errorCount variable if any fields are blank
	console.log($('#password').val() == '');
	if($('#email').val() == '' || $('#password').val() == '')
		alert("One or more fields are blank");
	if(!$('#email').val().includes('@'))
		alert("not a valid email");
}