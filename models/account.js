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
	}]
});

/*
var Rating = new Schema({
    author: Number, //{ type: Schema.ObjectId, ref: 'Account'},
    // target_profile_id: ObjectId,
    rate: Number,
	comment: String
});
*/

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);
// module.exports.Rating = mongoose.model('Rating', Rating);
