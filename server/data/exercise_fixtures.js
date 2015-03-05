/**
* Check if there are exercises present, and in case there are not, add some
* example exercises.
**/
var database = require('../database.js');
var collections = require('./collections');

database.getExercises(null, function(err, res) {
  if (err) {
    throw err;
  }
  if (res.length === 0) {
    addExercises();
  } else {
    console.log('Already exercises present, added none');
    process.exit();
  }
});
/**
* Add the exercises
* @param {function} callback with form callback(err, res)
*/
function addExercises() {
  var exercise1 = {
    chapter: 5,
    number: 1,
    name: 'Bereken oppervlakte circel',
    description: 'Schrijf een pure functie die de oppervlakte van een' +
      'circel berekent'
  };
  var exercise2 = {
    chapter: 5,
    number: 2,
    name: 'Genereer is wortel van x functies',
    description: 'Schrijf een functie isWortelVan() met een numerieke ' +
      'parameter n waarmee getest kan worden of n een worel is van g'
  };
  var exercise3 = {
    chapter: 5,
    number: 3,
    name: 'Object naar string',
    description: 'Schrijf een functie toString() met parameter obj ' +
      'die van het object obj een string representatie terug geeft in de ' +
      'vorm: "property1" = "value van property1", "property 2" = "' +
      'value van property2", "propertyN" = "value van propertyN" '
  };
  var exercises = [exercise1, exercise2, exercise3];
  var processed = 0;
  exercises.forEach(function(exercise) {
    database.putExercise(exercise, function(err, res) {
      if (err) {
        throw err;
      }
      processed += 1;
      if (processed === exercises.length) {
        console.log('Exercise fixtures pushed succesfully, added 3');
        process.exit();
      }
    });
  });
}
