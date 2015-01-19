/* constructor Solution object */
exports.Solution = function() {
  this.feedback = [];
  this.functions = [];
  this.fileLocation = '';
  this.plain = '';
  this.moduleFileLocation = '';
  this.abstractSyntaxTree;

  this.addFeedback = function(feedback) {
  	if(feedback && feedback.constructor === Array) {
  		var list = this.feedbackList;
  		feedback.forEach(function(feedbackItem) {
  			list[list.length] = feedbackItem;
  		});
  	} else if (feedback && feedback instanceof exports.Feedback) {
  		this.feedbackList[this.feedbackList.length] = feedback;
  	} else  {
  		throw new Error('A (array of) Feedback object should be added');
  	}
  }
}

/* constructor Feedback object */
exports.Feedback = function() {
	this.name;
	this.check;
	this.description;
	this.addressee;
	this.error;
}