var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	username: String, //never used but required by passport
	email: String,
    password: String,
	description: String,
	displayname: String,
	ipaddr: String,
	location: String,
	device: String,
	pageviews: Number,
	admin: Boolean,
	superadmin: Boolean,
	profilepicture: String,
<<<<<<< HEAD
	ratings: [{
		author: String,
		rate: Number,
		comment: String
	}],
=======
>>>>>>> parent of c50824f... Added Comments and Ratings
	doglover: Boolean,
	dogowner: Boolean
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);