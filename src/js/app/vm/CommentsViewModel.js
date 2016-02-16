/*
	@author Thabelo mmbengeni
	Model holds all comment models
 */
var commentsViewModel = function () {
	commentsVm = this;
	commentsVm.commentsList = ko.observableArray();
	commentsVm.sentimentList = [];
	commentsVm.selectedIndex = -1;
	commentsVm.allCommentsActive = 0;
	commentsVm.allCountPositive = ko.observable(0);
	commentsVm.allCountNegative = ko.observable(0);

	/*
		Gets all comments from the search term
		callbackData Object containg all search results 
	 */
	commentsVm.bindComments = function(callbackData) {
		// cleanup all data if available
		commentsVm.commentsList.removeAll();
		commentsVm.sentimentList = [];

		// set comment data
		var comments = callbackData.data.children;

		var index = 0;
		while( index < comments.length ) {
			var tmpData		= {};
			tmpData.id      = comments[index].data.id;
			tmpData.index   = index;
			tmpData.comment = comments[index].data.selftext;
			cleanComment	= tmpData.comment;
			tmpData.title	= comments[index].data.title;
			tmpData.url		= comments[index].data.url;
			tmpData.created = comments[index].data.created;
			tmpData.dateTime= moment(tmpData.created, 'X').format('MMMM Do YYYY, h:mm:ss a');
			tmpData.isHidden= ko.observable(false);

			tmpData.permalink	= comments[index].data.permalink;
			tmpData.cState		= ko.observable(true);
			tmpData.allComments = ko.observableArray();
			// analytics 
			tmpData.countPositive = ko.observable(0);
			tmpData.countNegative = ko.observable(0);
			// data bind UI elements
			if(typeof cleanComment != 'undefined') {
				cleanComment = cleanComment.replace(/\"/g, ' ');
				commentsVm.commentsList.push(tmpData);
				// prepare sentiment array list
				commentsVm.sentimentList.push(tmpData.comment);
			}
			index++;
		}
		if (comments.length < 1 ){
			app.displayError("No comments found with that phrase");
		} else {
			// if not all comments active then set to latest comments
			commentsVm.allCommentsActive = 0;
			app.getSentiment(commentsVm.sentimentList);
		}
	};

	/*
		Get selected thread
	 */
	commentsVm.loadAllComments = function(data) {
		commentsVm.selectedIndex = data.index;
		app.searchAllCommentsRedditApi(data.url);
	};

	/*
		Get all thread comments and bind to parent
	 */
	commentsVm.bindAllComments = function(callbackData) {
		var results = callbackData[1];
		commentsVm.sentimentList = [];
		commentsVm.commentsList()[commentsVm.selectedIndex].allComments.removeAll();

		var comments = results.data.children;
		var index = 0;
		while(index < comments.length) {
			var tmpData = {};
			tmpData.comment = comments[index].data.body;
			var cleanComment= tmpData.comment;
			tmpData.id		= comments[index].data.id;
			tmpData.cState  = ko.observable(false);
			tmpData.created = comments[index].data.created;
			tmpData.isHidden= ko.observable(false);

			// main list data array - bind child commet array
			if(typeof cleanComment != 'undefined') {
				cleanComment = cleanComment.replace(/\"/g, ' ');
				commentsVm.sentimentList.push(tmpData.comment);
				commentsVm.commentsList()[commentsVm.selectedIndex].allComments.push(tmpData);
			}
			index++;
		}
		if (comments.length < 1 ){
			app.displayError("No comments for this thread");
		} else {
			// set sentiment to all comments
			commentsVm.allCommentsActive = 1;
			app.getSentiment(commentsVm.sentimentList);
		}
	};

	/*
		Remove comments from list 
	 */
	commentsVm.clearAllComments = function(data) {
		commentsVm.commentsList()[data.index].allComments.removeAll();
	};

	/*
		Clear allsentiments 
	 */
	commentsVm.clearAllSentiment = function(data) {
		commentsVm.commentsList()[data.index].countNegative(0);
		commentsVm.commentsList()[data.index].countPositive(0);
		commentsVm.commentsList()[data.index].allComments.removeAll();
	};

	/*
		Get all comment sentiments
		callbackData Object containg all search results 
	 */
	commentsVm.bindSentiments = function(callbackData) {
		var sentiments = callbackData;
		var index = 0;
		if( commentsVm.allCommentsActive === 0 ) {
			// reset values 
			commentsVm.commentsList()[index].countNegative(0);
			commentsVm.commentsList()[index].countPositive(0);

			index = 0;
			while(index < sentiments.length) {
				if(sentiments[index].result == "Negative") {
					commentsVm.commentsList()[index].countNegative(commentsVm.commentsList()[index].countNegative()+1);
					commentsVm.commentsList()[index].cState(false);
				} else if ( sentiments[index].result == "Positive") {
					commentsVm.commentsList()[index].countPositive(commentsVm.commentsList()[index].countPositive()+1);
					commentsVm.commentsList()[index].cState(true);
				}
				index++;
			}
			app.displayInfo("Done... Thanks you");
			$(".all-comments").removeClass("hidden");
		} else if ( commentsVm.allCommentsActive === 1 ) {
			// reset values 
			commentsVm.commentsList()[commentsVm.selectedIndex].countNegative(0);
			commentsVm.commentsList()[commentsVm.selectedIndex].countPositive(0);

			index = 0;
			while(index < sentiments.length) {
				if(sentiments[index].result == "Negative") {
					commentsVm.commentsList()[commentsVm.selectedIndex].countNegative(commentsVm.commentsList()[commentsVm.selectedIndex].countNegative()+1);
					commentsVm.commentsList()[commentsVm.selectedIndex].allComments()[index].cState(false);
				} else if ( sentiments[index].result == "Positive") {
					commentsVm.commentsList()[commentsVm.selectedIndex].countPositive(commentsVm.commentsList()[commentsVm.selectedIndex].countPositive()+1);
					commentsVm.commentsList()[commentsVm.selectedIndex].allComments()[index].cState(true);
				}
				index++;
			}
			app.displayInfo("Done... Thanks you");
			$(".all-comments").removeClass("hidden");
		}
		// update UI
		app.calculateValues();
	};
};