module.exports = function(module, feedback) {
  if (module === 'check-syntax') {
    var src = 'Unexpected identifier';
    var tgt = 'Onverwachte variabele';
    var pos = feedback.description.indexOf(src);
    if (pos >= 0) {
      feedback.description = feedback.description.replace(src, tgt);
    }
  }  return feedback;
};
