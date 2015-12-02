var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash'); // for errors 

var app = express();

var fs = require('fs');
var geoip = require('geoip-lite');
 
//Set up gridfs to store pictures
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;
var URI = "mongodb://heroku_7x6mqnpd:s6q13aib0fhtvbq8nh0og4gt57@ds061954.mongolab.com:61954/heroku_7x6mqnpd"
/*conn.once('open', function () {
    var gfs = Grid(conn.db);
	gfs.findOne({ filename: 'Default.jpg' },function (err, file) {   
		//put default profile picture into db if not already in there
		if(file==null){
			//filename to store in mongodb
			var writestream = gfs.createWriteStream({
				filename: 'Default.jpg'
			});
			fs.createReadStream('Default.jpg').pipe(writestream);
			writestream.on('close', function (file) {
				// do something with `file`
				console.log(file.filename + 'Written To DB');
			});
		}
	})  
});*/

//require device to know which type of device is being used
var device = require('express-device');
app.set('view options', { layout: false });
app.use(device.capture());


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var multer = require('multer');
var upload = multer({ dest: './uploads' });

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

//app.use(bodyParser.json());
app.use(bodyParser.json({ keepExtensions : true, 
    uploadDir : path.join(__dirname,'/files')})
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.enable('trust proxy');

app.use('/', routes);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
//passport.serializeUser(Account.serializeUser());
//passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://heroku_7x6mqnpd:s6q13aib0fhtvbq8nh0og4gt57@ds061954.mongolab.com:61954/heroku_7x6mqnpd');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('./models/account');
var fbConfig = require('./fb.js');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : fbConfig.appID,
        clientSecret    : fbConfig.appSecret,
        callbackURL     : fbConfig.callbackUrl
    },

    // facebook will send back the tokens and profile
    function(access_token, refresh_token, profile, done) {

    	console.log('profile', profile);

		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
	        User.findOne({ 'id' : profile.id }, function(err, user) {

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
	                return done(null, user); // user found, return that user
	            } else {
	                // if there is no user found with that facebook id, create them
	                var newUser = new User();

					// set all of the facebook information in our user model
	                newUser.fb.id    = profile.id; // set the users facebook id	                
	                newUser.fb.access_token = access_token; // we will save the token that facebook provides to the user	                
	                newUser.fb.firstName  = profile.name.givenName;
	                newUser.fb.lastName = profile.name.familyName; // look at the passport user profile to see how names are returned
	                newUser.fb.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;

	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }

	        });
        });

    }));

};

module.exports = app;