var assert = require('assert');

var index = require('./routes/index.js');

describe('Index Routes Tests', function(){
    it('Password validation returns false for password: "test" and username: "blah".',function(done){
       assert.equal(index.backendValidatePassword('test','blah'),false);
        done();
    });
});