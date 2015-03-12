module.exports = function(check, feedback) {
  switch (check)
  {
    case 'check-syntax':
      var src = 'Unexpected identifier';
      var tgt = 'Onverwachte variabele';
      var pos = feedback.description.indexOf(src);
      if (pos >= 0) {
        feedback.description = feedback.description.replace(src, tgt);
      }
      break;
    case 'check-format':
      break;
    case 'check-functionality':
      break;
  }
  feedback.description = feedback.description.replace('Line', 'Regel');
  return feedback;
};
