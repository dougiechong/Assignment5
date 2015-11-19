GROUP MEMBERS 

1. PARASTOO ABTAHI 
EMAIL: parastoo.abtahi@mail.utoronto.ca
CDF ID: c5abtahi

2. 

3. 

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

search for "require('../build/Release/bson')" in the a4 folder and 
replace all instances with "require('../browser_build/bson')"

*********************************************************************

DOWNLOADS: 

you may have to install connect-flash for the passport authentication
this can be installed using "npm install connect-flash"
for more information see: 
https://github.com/jaredhanson/connect-flash/blob/master/README.md