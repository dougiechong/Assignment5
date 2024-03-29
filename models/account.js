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
	ratings: [{
		author: String,
		rate: Number,
		comment: String
	}],
	requests: [{
		starttime: String,
		endtime: String,
		acceptedby: String,
	}],
	doglover: Boolean,
	dogowner: Boolean,
	lat: Number,
	lng: Number,
	fb: {
		id: String,
		access_token: String,
		firstName: String,
		lastName: String,
		email: String
	},
	twitter: {
		id: String,
		token: String,
		username: String,
		displayName: String,
		lastStatus: String
	}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);