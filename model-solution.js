const OK = "";
NOK = "";
EPS = 1e-2;

function test(actual, expected) {
  print(Math.abs(expected-actual) < EPS ? OK : NOK +
  "expected: "+ expected + "actual: "+ actual);
  
  /*
  function calcBMI(lengte:integer,gewicht:number)->numberGoal: berekent BMI-index op basis van gewicht(kg)/lenget(m)^2
  
  Parameters:
    lengte:  lichaamslengte in cm
             (minimum 75 cm, maximum 225 cm)
    gewicht: lichaamsgewicht in kg
             (minimum 30 kg, maximum 250 kg)
  		   
  Returns: de BMI-indexThrows exeption als een of meer parameters een waarde
  hebben buiten aangegeven interval
  		   
  */
  
  function calcBMI(lengte, gewicht) {
    if (lengte < 75 ||
        lengte > 225 ||
        gewicht < 30 ||
        gewicht > 250) {
      throw new Error("Lengte of gewicht onjuist: \
          lengte moet tussen 75 en 225 liggen; gewicht tussen 30 en 250");
    }
    return gewicht / ((lengte / 100) * (lengte / 100));
  }
  
  test(calcBMI(180, 80), 80 / (1.8 * 1.8));
  test(calcBMI(100, 50), 50 / (1 * 1));
  test(calcBMI(200, 50), 50 / (2 * 2));
  test(calcBMI(75, 50), 50 / (0.75 * 0.75));
  
  try {
    calcBMI(300,100);
  } catch(error) {
    print(error.message);
  }
  
  try {
    calcBMI(74,50);
  } catch(error) {
    print(error.message);
  }
} 

