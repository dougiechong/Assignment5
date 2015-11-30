/*****************************************************************************************/
/* include all required files */ 
var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var si = require('search-index')({indexPath: 'searchindex', logLevel: 'info'});
var async = require('async');

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/fail');
}
/*****************************************************************************************/

//used to find location given IP address
var geoip = require('geoip-lite');
router.get('/awesome2', function (req, res) {
 if(req.session.lastPage) {
	console.log(req.session.lastPage);
 }
 var ip = req.ip;
 console.log("IP" + ip);

var ip = "207.97.227.239";
var geo = geoip.lookup(ip);
console.log(geo);
 //console.log(req.connection);
 console.log(req.session);
 req.session.lastPage = '/awesome2';
 res.send("hi");
});

router.post('/clickeduser/:username', function (req, res) {
	req.session.userClicked = {username: req.params.username};
	console.log(req.session.userClicked);
	res.redirect('/');
 });
 
 router.get('/clickeduser', function (req, res) {
	console.log(req.session.userClicked);
	res.json(req.session.userClicked)
 });

/*****************************************************************************************/
router.get('/', function (req, res) {
	console.log("USER" + req.user);
    res.render('index', {user : req.user});
});

var multer = require('multer');
var fs = require('fs');
var upload = multer({dest: './uploads/'});
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;

router.get('/file/:id',function(req,res){
    var pic_id = req.param('id');
	var gfs = Grid(conn.db);
	gfs.findOne({ filename: pic_id },function (err, file) {   
		if(file!=null){
			res.writeHead(200, {'Content-Type': "image"});   
			readstream = gfs.createReadStream({filename: pic_id});
			readstream.pipe(res);  
		}else{ 
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end();
		}
	})    
});

// Used to set a default picture
router.get('/default',function(req,res){
	var gfs = Grid(conn.db);
	gfs.findOne({ filename: 'Default.jpg' },function (err, file) {   
		if(file!=null){
			res.writeHead(200, {'Content-Type': "image"});   
			//
			readstream = gfs.createReadStream({filename: 'Default.jpg' });
			readstream.pipe(res);  
		}else{ 
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end();
		}
	})   
});

//find the id of picture
router.all('/changePicture', upload.single('avatar'), function(req, res) {
	console.log(req.file);
     var dirname = require('path').dirname(__dirname);
     var filename = req.file.filename;
     var path = req.file.path;
     var type = req.file.mimetype;
	 console.log(dirname + '/' + path);
	 console.log(req.file);
      
     var read_stream =  fs.createReadStream(dirname + '/' + path);
 
     var conn = mongoose.connection;
	 var Grid = require('gridfs-stream');
	 Grid.mongo = mongoose.mongo;
 
	 var gfs = Grid(conn.db);
	 console.log(filename);
	 var writestream = gfs.createWriteStream({
		filename: filename
	});
	fs.createReadStream(path).pipe(writestream);
 
	writestream.on('close', function (file) {
		// do something with `file`
		console.log(file.filename + 'Written To DB');
		console.log(req.body.phtotoemail);
		// update profile picture
		Account.findOneAndUpdate({
			email: req.body.photoemail
			},
			{
				profilepicture: file.filename
			}, function(err, account) {
				if (err) {
				  return res.render("/", {info: "Sorry. error"});
				}
				res.redirect('/');
		});
	});
});

/*****************************************************************************************/
/* GET userlist */

router.get('/userlist', function(req, res) {
    Account.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*****************************************************************************************/
/* Delete user */

router.delete('/userlist', function(req, res) {
    Account.removeUser({},{},function(e,docs){
        res.json(docs);
    });
});

/*****************************************************************************************/
/* sign up page */ 
router.get('/register', function(req, res) {
    res.render('register', { title: 'Register' });
});

router.backendValidatePassword = function(password,username){
	var hasNumber = /\d/;
	var hasCapital = /[A-Z]/;
	var hasLower = /[a-z]/;

	if(password.length < 8){
		return false;
	}else if(password.indexOf(username)>-1){
		return false;
	}else if(!hasNumber.test(password)){
		return false;
	}else if(!hasCapital.test(password)){
		return false;
	}else if(!hasLower.test(password)){
		return false;
	}

	return true;
};

router.backendValidateUsername = function(username){
	var hasAt = /[@]/;

	return hasAt.test(username);
};

router.post('/register', function(req, res) {
	var isSuperadmin=false;
	var isAdmin = false;
	Account.count(function (err, count) {
		if (!err && count === 0) {
			isSuperadmin=true;
			isAdmin = true;
		}
		var geo = geoip.lookup(req.ip);
		if(req.body.dogowner)
			var local_dogowner = true;
		else
			var local_dogowner = false;
		if(req.body.doglover)
			var local_doglover = true;
		else
			var local_doglover= false;

		if(!router.backendValidatePassword(req.body.password,req.body.username)){
			console.log('Here');
			return res.render('register', {info: "Incorrect password format!"});
		}

		if(!router.backendValidateUsername(req.body.username)){
			return res.render('register', {info: "Incorrect username format!"});
		}

		//username should be email, as it is required  for passport
		Account.register(new Account({ username : req.body.username,  email : req.body.username,
									   displayname: req.body.username, superadmin: isSuperadmin,
									   ipaddr: req.ip, location: geo, device: req.device.type, pageviews: 0,
									   profilepicture: "Default.jpg", doglover: local_doglover,
									   dogowner: local_dogowner,
									   admin: isAdmin, lat: req.body.lat, lng: req.body.lng}), req.body.password, function(err, account) {
			if (err) {
			  return res.render('register', {info: "Email already exists!"});
			}
			
			if (req.body.password != req.body.confirmpassword) {
			  return res.render('register', {info: "Incorrect password!"});
			}
			
      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      });

		});
	});
});

/*****************************************************************************************/
/* find the user to be edited by email and update description */

router.post('/edit', function(req, res) {
	Account.findOneAndUpdate({
		email: req.body.email
		},
		{
			displayname: req.body.displayname,
			description: req.body.description
		}, function(err, account) {
			if (err) {
			  return res.render("/", {info: "Sorry. error"});
			}
			res.redirect('/');
	});
});

//Add a comment and rating
router.post('/comment', function(req, res) {
	console.log("req.body.commentemail:  "+req.body.commentemail);
	console.log("req.body.authoremail:  "+req.body.authoremail);
	Account.findOneAndUpdate({ //Account.1push?
		email: req.body.commentemail
		},
		{
			$push: {
				ratings: {
					author: req.body.authoremail,
					rate: req.body.ratingnumber,
					comment: req.body.comment
				}}}
		, function(err, account) {
			if (err) {
			  return res.render("/", {info: "Sorry. error"});
			}
			res.redirect('/');
	});
});

router.get('/search', function(req, res) {
	var searchterm = req.query.searchterm;
    var searchfield = req.query.searchfield;

    var q={};
    q.query = {};
    q.query[searchfield] = [searchterm];
            
    // Run the following three functions in series: Empty the index; query the DB and add all documents to the index; then finally search the index
    async.series([
        function EmptyIndex(callback){
            si.empty(function(err) {
                console.log('emptied index');
                callback();
            })
            
        }, 
        function UpdateIndex(callback){
            Account.find({},{},function(e,docs){
                console.log("the current database contents: "+docs);
                var stringdocs = JSON.stringify(docs);
                var parsedocs = JSON.parse(stringdocs);
                console.log("parsedocs: "+parsedocs);
                
                //from here, we will update the index with newest information
                si.add(parsedocs, {}, function(err) {
                    console.log('indexing complete;');
                    callback();
                  }); 
            })
            
        }],
        //after the index is updated, we do the search using the query term received
        function SearchIndex(){
         /*    si.match(matchOptions, function(err, results) {
            console.log('Performing search with query: '+searchterm);
                res.json(results);
            }); */
            si.search(q, function(err, results) {
            console.log('Performing search with query: '+searchterm);
                res.json(results);
            });
        }
    );
});


//=================================================================== TEMPORARY======================================================================
router.get('/match', function(req, res) {
	var searchterm = req.query.searchterm;
    var searchfield = req.query.searchfield;
    var matchOptions = {
          beginsWith: searchterm, // The beginning of the text to match
          field: searchfield,     // The field to use (defaults to all fields)
          threshold: 2,   // The amount of characters to ignore before returning matches (default: 3)
          limit: 20,      // The maximum amount of suggestions
          type: 'ID'  // The type of autosuggest returned- can be `simple`, `ID` or `count`
        }
    var q={};
    q.query = {};
    q.query[searchfield] = [searchterm];
    // q={"query":{"*":["james"]}};
            
    // Run the following three functions in series: Empty the index; query the DB and add all documents to the index; then finally search the index
    async.series([
        function EmptyIndex(callback){
            si.empty(function(err) {
                console.log('emptied index');
                callback();
            })
            
        }, 
        function UpdateIndex(callback){
            Account.find({},{},function(e,docs){
                console.log("the current database contents: "+docs);
                var stringdocs = JSON.stringify(docs);
                var parsedocs = JSON.parse(stringdocs);
                console.log("parsedocs: "+parsedocs);
                
                //from here, we will update the index with newest information
                si.add(parsedocs, {}, function(err) {
                    console.log('indexing complete;');
                    callback();
                  }); 
            })
            
        }],
        //after the index is updated, we do the search using the query term received
        function SearchIndex(){
             si.match(matchOptions, function(err, results) {
            console.log('Performing search with query: '+searchterm);
                res.json(results);
            }); 

        }
    );
});


//final search - combine match and search of Search-Index
router.get('/searchresults', function(req, res) {
	var searchterm = req.query.searchterm;
    //for some reason, the . character messes up the search results. remove everythine after
    // searchterm = searchterm.substring(0, searchterm.indexOf('.'));
    searchterm = searchterm.split('.')[0]
    console.log("serach term is:  " +searchterm);
    var searchfield = req.query.searchfield;
            
    // Run the following three functions in series: Empty the index; query the DB and add all documents to the index; then finally search the index
    async.series([
        function EmptyIndex(callback){
            si.empty(function(err) {
                console.log('emptied index');
                callback();
            })
            
        }, 
        function UpdateIndex(callback){
            Account.find({},{},function(e,docs){
                console.log("the current database contents: "+docs);
                var stringdocs = JSON.stringify(docs);
                var parsedocs = JSON.parse(stringdocs);
                console.log("parsedocs: "+parsedocs);
                
                //from here, we will update the index with newest information
                si.add(parsedocs, {}, function(err) {
                    console.log('indexing complete;');
                    callback();
                  }); 
            })
            
        },
        //after the index is updated, use si.match
        function MatchIndex(callback){
            var matchOptions = {
              beginsWith: searchterm, // The beginning of the text to match
              field: searchfield,     // The field to use (defaults to all fields)
              threshold: 2,   // The amount of characters to ignore before returning matches (default: 3)
              limit: 20,      // The maximum amount of suggestions
              type: 'ID'  // The type of autosuggest returned- can be `simple`, `ID` or `count`
            } 
            
            si.match(matchOptions, function(err, results) {
                console.log('Performing search with query: '+searchterm);
                    console.log("matchIndex results = "+results);
                    callback(null,results);
                });
        
        }],
        
        //then use si.search with the match results
        function SearchIndex(err,matchresults){  //matchresults = results from function MatchIndex
            matchresults = matchresults.join(',');
            matchresults = matchresults.split(',');
            matchresults.splice(0,3);
            //at this point, matchresults is an array the elements of the arrays are the document.id of the results found.
            //need to strip the first 2 characters of each document.id because of technicalities with search-index.search module
            
/*             for (i = 0; i < matchresults.length; i++)
            {
                matchresults[i] = matchresults[i].substring(2);
                // matchresults[i] = '"'+matchresults[i]+'"';
            } */
            
            // now we need to put it back into a comma separated strings because that's how searc-index module takes in the query parameters
            // matchresults = matchresults.join(',');
            // matchresults = matchresults.substring(1, matchresults.length-1);
            // matchresults = '[' + matchresults +']';
            console.log("matchresults = "+matchresults);
            console.log("matchresults[2] = "+matchresults[2]);
            
            
            var q={};
            q.query = {};
            // q.query[searchfield] = matchresults;
            // q.query = {
              // '*': [matchresults]
            // };
            
            q.query['*'] = matchresults[2];
            
            si.search({"query":{"*":["*"]}}, function(err, results) {
            console.log('Performing search with query: '+results);
            var matchfound=0;
                for(i = 0; i < results.hits.length; i++)
                {
                    matchfound = 0;
                    
                    for(j = 0; j < matchresults.length; j++)
                    {
                        console.log("results.hits[i].document.id = "+results.hits[i].document.id);
                        console.log("matchresults[j] = "+matchresults[j]);
                        
                        if(results.hits[i].document.id == matchresults[j]) 
                        {
                            matchfound=1;
                            break;
                        }
                    }
                    
                    if(matchfound==0)
                    {
                        console.log("MATCH NOT FOUND");
                        console.log("results.hits[i].document.id = "+results.hits[i].document.id);                       
                        //delete element in the array
                        results.hits.splice(i,1);
                        i--;
                        // console.log("AFTER results.hits[i].document.id = "+results.hits[i].document.id); 
                        
                    }
                }
                
                res.json(results);
            });
        }
    );
});

//=========================================================================================================================================================================


//Add a request
router.post('/requestdoglover', function(req, res) {
	Account.findOneAndUpdate({ 
		email: req.session.passport.user
		},
		{
			$push: {
				requests: {
					starttime: req.body.starttime.toString(),
					endtime: req.body.endtime.toString(),
					acceptedby: ""
				}
			}
		}
		, function(err, account) {
			if (err) {
			  return res.render("/", {info: "Sorry. error"});
			}
			res.redirect('/');
	});   
});

//Accept a request
router.post('/acceptrequest/:id/:reqid', function(req, res) {
	Account.findOneAndUpdate(
	   { email: req.params.id, "requests._id": req.params.reqid},
	   { $set: { "requests.$.acceptedby" :  req.session.passport.user} },
	function(err, account) {
			if (err) {
			  return res.render("/", {info: "Sorry. error"});
			}
			res.redirect('/');
	});
});

//find the user to have password changed
router.post('/changepassword',passport.authenticate('local'), function (req, res){
	console.log("hi");
	console.log(req.session.userClicked.username);
	Account.findByUsername(req.session.userClicked.username, function(e, sanitizedUser){
		if (req.body.newpassword != req.body.confirmpassword) {
		  return res.status(200).json({info: "Sorry. Password does not match Confirm Password. Try again."});
		}
		if (sanitizedUser){
			sanitizedUser.setPassword(req.body.newpassword, function(){
				sanitizedUser.save();
				res.redirect('/');
			});
		} else {
			res.status(200).json({status: 0, msg: 'This user does not exist'});
		}
	});
});

//find the user to be made an administrator
router.post('/makeadmin/:id/:state', function(req, res) {
	Account.findOneAndUpdate({
		_id: req.params.id
		},
		{
			admin: req.params.state
		}, function(err, account) {
			if (err) {
			  return res.render("/", {info: "Sorry. error"});
			}
			res.redirect('/');
	});
});

//find the user of page clicked, increase the page views
router.post('/increasepagecount/:id/:pageviews', function(req, res) {
	Account.findOneAndUpdate({
		_id: req.params.id
		},
		{
			pageviews: parseInt(req.params.pageviews) + 1
		}, function(err, account) {
			if (err) {
			  return res.render("/", {info: "Sorry. error"});
			}
			res.redirect('/');
	});
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var userToDelete = req.params.id;
    Account.remove({ '_id' : userToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*****************************************************************************************/
/* login page */ 

router.get('/login', function(req, res) {
    res.render('login', { user : req.user, info: req.flash('info')});
});

router.get('/flash', function(req, res){
  req.flash('info', "Account does not exist!")
  res.redirect('/login');
});

router.post('/login', 
	passport.authenticate('local', { successRedirect: '/',
                                   	failureRedirect: '/flash'})
);

/*****************************************************************************************/
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// route for facebook authentication and login
// different scopes while logging in
router.get('/login/facebook', 
  passport.authenticate('facebook', { scope : ['email', 'public_profile'] }
));

// handle the callback after facebook has authenticated the user
router.get('/login/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect : '/',
		failureRedirect : '/'
	})
);

// route for twitter authentication and login
// different scopes while logging in
router.get('/login/twitter',  
  passport.authenticate('twitter')
);
 
// handle the callback after facebook has authenticated the user
router.get('/login/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect : '/',
    failureRedirect : '/'
  })
);

module.exports = router;
