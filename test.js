var assert = require('assert');

var app = require('./app.js');
var http = require('http');
var server = http.createServer(app);

before(function() {
    server.listen(3000);
});

// The function passed to after() is called after running the test cases.
after(function() {
    server.close();
});

describe('Index Routes Tests', function(){
    it('Password too short (password: "Test1" and username: "blah").',function(done){
       assert.equal(app.routes.backendValidatePassword('Test1','blah'),false);
        done();
    });

    it('Password does not include capital letter (password: "tester10" and username: "blah").',function(done){
        assert.equal(app.routes.backendValidatePassword('tester10','blah'),false);
        done();
    });

    it('Password does not include lowercase letter (password: "TESTER10" and username: "blah").',function(done){
        assert.equal(app.routes.backendValidatePassword('TESTER10','blah'),false);
        done();
    });

    it('Password does not include number (password: "IamTesting" and username: "blah").',function(done){
        assert.equal(app.routes.backendValidatePassword('IamTesting','blah'),false);
        done();
    });

    it('Password includes username (password: "thisHasblah10" and username: "blah").',function(done){
        assert.equal(app.routes.backendValidatePassword('thisHasblah10','blah'),false);
        done();
    });

    it('Password is valid (password: "Testing10" and username:"blah").', function(done){
        assert.equal(app.routes.backendValidatePassword('Testing10','blah'),true);
        done();
    });

    it('Username does not include "@" (username: "tester").' ,function(done){
        assert.equal(app.routes.backendValidateUsername('tester'),false);
        done();
    });

    it('Username is valid (username: "tester@testing.com").' ,function(done){
        assert.equal(app.routes.backendValidateUsername('tester@testing.com'),true);
        done();
    });

    it('Lat and Lng are invalid (lat:"testlat" and lng:"testlng")' ,function(done){
        assert.equal(app.routes.backendValidateLatLng('testlat','testlng'),false);
        done();
    });

    it('Lat and Lng are valid (lat: "40.33333" and lng: "35.6666")' ,function(done){
        assert.equal(app.routes.backendValidateLatLng(40.33333,35.6666),true);
        done();
    });

    it('Login page is accessible without authentication:' ,function(done){
        http.get('http://localhost:3000/login', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });

    it('Register page is accessible without authentication:' ,function(done){
        http.get('http://localhost:3000/register', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });

    it('Home page is not accessible without authentication:' ,function(done){
        http.get('http://localhost:3000/register', function (res) {
            assert.equal(200, res.statusCode);
            done();
        });
    });
});