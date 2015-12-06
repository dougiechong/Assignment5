GROUP MEMBERS 

1. PARASTOO ABTAHI 
EMAIL: parastoo.abtahi@mail.utoronto.ca
CDF ID: c5abtahi

2. Douglas Chong
Email:douglas.chong@mail.utoronto.ca
CDF ID: c4chongd

3. Shubham Dhond
Email: shubham.dhond@mail.utoronto.ca
CDF ID: g5dhonds

4.

*********************************************************************

STEPS: 

1. sudo npm install 
2. sudo node server.js 

*********************************************************************

NOTE: 

if you get the following error upon installation 
{ [Error: Cannot find module '../build/Release/bson'] code: 'MODULE_NOT_FOUND' } 
  js-bson: Failed to load c++ bson extension, using pure JS version

search for "require('../build/Release/bson')" in the Assignment5 folder and 
replace all instances with "require('../browser_build/bson')"

*********************************************************************

DOWNLOADS: 

you may have to install connect-flash for the passport authentication
this can be installed using "npm install connect-flash"
for more information see: 
https://github.com/jaredhanson/connect-flash/blob/master/README.md

*********************************************************************

UNIT TESTS:

This application includes unit testing which was implemented using
the Mocha test framework for JavaScript. These tests check that the basic
functionality of the application is working. To run the unit tests run
the commands below in the root directory of the application:

1. sudo npm install

2. sudo mocha test