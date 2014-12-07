var esprima = require('esprima');
var abSynTree;
var options = {tolerant:true,
		loc: true,
		range: true,
		raw: true,
		tokens: true,
		comment:true};

module.exports = function(js, callback, filename) {
  try {
    abSynTree = esprima.parse(js, options);
    callback(null, abSynTree);
  } catch (e) {
	//Aard error etc.
	/*for(var propertyName in e) {
	console.log(propertyName + ': ' + e[propertyName]);
	}*/
    callback(e);
	//callback(e);
  }
}
