See the [wiki pages](https://github.com/Slotkenov/javascript-examiner/wiki)
for a manual of the Javascript Examiner.

# Development

## Prerequisits
- NodeJS
- NPM
  - Bower
  - Gulp
- [mongoDB](http://www.mongodb.org/) (on [Linux](http://docs.mongodb
.org/manual/administration/install-on-linux/), [OS X](http://docs.mongodb
.org/manual/tutorial/install-mongodb-on-os-x/) or [Windows](http://docs
.mongodb.org/manual/tutorial/install-mongodb-on-windows/))

## Installing
- Clone the project
- Run `npm install`
- Run `bower install`

## Running
Run `gulp` to start the server.

## Configure

### JSCS
Formatting of the code is checked using JSCS.
You can configure the formatting you would like the student code to adhere to
using the configuration file `server/check-format/jscs-config.json`.
There is [an overview of the possible rules](http://jscs.info/rules.html)
available on the JSCS website.
You can also choose from
[a range of presets](https://github.com/jscs-dev/node-jscs/tree/master/presets).
By default, 
[Googles preset](https://github.com/jscs-dev/node-jscs/blob/master/presets/google.json)
is used.

### MongoDB
You need to set a node.js environment variable 'MONGOLAB_URI' containing the
URI to the MongoDB store. For instance you can place that variable in a .env
file in the root of the project.

### Email
An email will be sent to new users for creating a password.
Also when a password needs to be reset an email es sent.
This is done through the email address javascript.examiner@gmail.com
for which the server needs the password.
The password can be provided using a node.js environment variable
'EMAIL_PASSWORD'.
For instance you can place that variable in a .env file
in the root of the project.
