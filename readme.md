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

## Tests
All unittests will run automatically with gulp. The test files can be
recognized by the `.test` annotation (which make `gulp` run the tests) in the
filename. There is one integration test
that wouldn't run automatically (`server/server.manual-test.js`),
to test the RESTful server. (because it actually initializes the server, and
conflicts with the main initialization of `gulp`).

All tests can be initialized automatically as well with a testrunner like
`mocha`.

## Configure

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

### Feedback mapper
The feedback mapper makes it possible to provide your own feedback messages
instead of the default error messages from modules like jscs and esprima.
In the server directory a file will be created.
One for the format check and one for the syntax check.
They will be named 'check-format-feedback' and 'check-syntax-feedback'
respectivily.
The files contain a JSON object with key value pairs.
For each generated feedback message a key value pair is generated
in the corresponding file
using the error code as the key
and the default message from the corresponding module as the value.
The values can be changed manually
in order to provide custom messages for a specific error code.
If you want to provide a custom message for an error code
which not yet exists in the file,
you can create a new entry.

Esprima unfortunately does not provide an error code,
which results in the original message being used as the key.
