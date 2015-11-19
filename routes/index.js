var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();

//used to find location given IP address
var geoip = require('geoip-lite');
router.get('/awesome2', function (req, res) {
 if(req.session.lastPage) {
	console.log(req.session.lastPage);
 }
 var ip = req.ip
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
	console.log("req: "+req.body.username);
	res.redirect('/');
 });
 
 router.get('/clickeduser', function (req, res) {
	console.log("get "+req.session.userClicked);
	Account.findOne({"username":req.session.userClicked.username},{},function(e,docs){
		console.log("docs " + docs);
        res.json( {"userClicked": req.session.userClicked, "request": req.body, "viewuser": docs})
    });
	
 });

router.get('/', function (req, res) {
    res.render('index', {user : req.user});
});

router.get('/register', function(req, res) {
    res.render('register', { });
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

/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    Account.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * Delete user
 */
router.delete('/userlist', function(req, res) {
    Account.removeUser({},{},function(e,docs){
        res.json(docs);
    });
});

router.post('/register', function(req, res) {
	var isSuperadmin=false;
	var isAdmin = false;
	Account.count(function (err, count) {
		console.log(count);
		if (!err && count === 0) {
			isSuperadmin=true;
			isAdmin = true;
		}
		var geo = geoip.lookup(req.ip);
		//username should be email, as it is required  for passport
		Account.register(new Account({ username : req.body.username,  email : req.body.username,
									   displayname: req.body.username, superadmin: isSuperadmin,
									   ipaddr: req.ip, location: geo, device: req.device.type, pageviews: 0,
									   profilepicture: "Default.jpg",
									   admin: isAdmin}), req.body.password, function(err, account) {
			if (err) {
			  return res.render("register", {info: "Sorry. That email already exists. Try again."});
			}
			
			if (req.body.password != req.body.confirmpassword) {
			  return res.render("register", {info: "Sorry. Password does not match Confirm Password. Try again."});
			}
			
			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	});
});

//find the user to be edited by email and update description
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

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;