var assert = require('assert');

var index = require('./routes/index.js');
var http = require('http');

describe('Index Routes Tests', function(){
    it('Password too short (password: "Test1" and username: "blah").',function(done){
       assert.equal(index.backendValidatePassword('Test1','blah'),false);
        done();
    });

    it('Password does not include capital letter (password: "tester10" and username: "blah").',function(done){
        assert.equal(index.backendValidatePassword('tester10','blah'),false);
        done();
    });

    it('Password does not include lowercase letter (password: "TESTER10" and username: "blah").',function(done){
        assert.equal(index.backendValidatePassword('TESTER10','blah'),false);
        done();
    });

    it('Password does not include number (password: "IamTesting" and username: "blah").',function(done){
        assert.equal(index.backendValidatePassword('IamTesting','blah'),false);
        done();
    });

    it('Password includes username (password: "thisHasblah10" and username: "blah").',function(done){
        assert.equal(index.backendValidatePassword('thisHasblah10','blah'),false);
        done();
    });

    it('Password is valid (password: "Testing10" and username:"blah").', function(done){
        assert.equal(index.backendValidatePassword('Testing10','blah'),true);
        done();
    });

    it('Username does not include "@" (username: "tester").' ,function(done){
        assert.equal(index.backendValidateUsername('tester'),false);
        done();
    });

    it('Username is valid (username: "tester@testing.com").' ,function(done){
        assert.equal(index.backendValidateUsername('tester@testing.com'),true);
        done();
    });

    it('Lat and Lng are invalid (lat:"testlat" and lng:"testlng")' ,function(done){
        assert.equal(index.backendValidateLatLng('testlat','testlng'),false);
        done();
    });

    it('Lat and Lng are valid (lat: "40.33333" and lng: "35.6666")' ,function(done){
        assert.equal(index.backendValidateLatLng(40.33333,35.6666),true);
        done();
    });
});