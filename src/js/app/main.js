/*
	@author: Thabelo Mmbengeni
	Main Application 
*/

// wait for all html to load .
var app = new Application();
$( document ).ready(function() {
	$('input[name="daterange"]').daterangepicker(
		{
			locale: {
				format: 'YYYY-MM-DD'
			}
		},
		function(start, end,label){
			app.filterByDate(start, end,label);
		});
});

/*
	Main app
 */
function Application (options) {
	commentsApp = this;
	var defaultOptions = {
		"searchFieldId": "#searchWord",
		"api" : [
					{
						"name": "reddit",
						"redditApi": "http://www.reddit.com",
						"desciption": "api returns data set from the use searchword"
					},
					{
						"name": "vivekn",
						"sentimentApi": "http://sentiment.vivekn.com/api/batch/",
						"desciption": "api return coment jugdement to be positive or nergative"
					},

				]
	};
	commentsApp.config = $.extend({}, defaultOptions, options);
}

/*
	Filter comments by date range selected 
 */
Application.prototype.filterByDate = function(start, end, label) {
	// selected datetime to unix epoch
	var unixStart = moment(start.format()).unix();
	var unixEnd = moment(end.format()).unix();

	var index = 0;
	while(index < commentsVm.commentsList().length){
		if( commentsVm.commentsList()[index].created >= unixStart && commentsVm.commentsList()[index].created <= unixEnd ) {
			commentsVm.commentsList()[index].isHidden(false);
		}else{
			commentsVm.commentsList()[index].isHidden(true);
		}
		var innerIndex = 0;
		while(innerIndex < commentsVm.commentsList()[index].allComments().length) {
			if( commentsVm.commentsList()[index].allComments()[innerIndex].created >= unixStart && commentsVm.commentsList()[index].allComments()[innerIndex].created <= unixEnd ) {
				commentsVm.commentsList()[index].isHidden(false);
			}else{
				commentsVm.commentsList()[index].isHidden(true);
			}
			innerIndex++;
		}
		index++;
	}
	app.calculateValues();
	app.displayInfo("Data filtered by date");
};

/*
	Filter comments by date range selected 
 */
Application.prototype.calculateValues = function() {
	// selected datetime to unix epoch
	var positive = 0;
	var negative = 0;

	var index = 0;
	while(index < commentsVm.commentsList().length){

		if(!commentsVm.commentsList()[index].isHidden()) {
			if(commentsVm.commentsList()[index].cState()){
				positive++;
			} else {
				negative++;
			}
		}

		var innerIndex = 0;
		while(innerIndex < commentsVm.commentsList()[index].allComments().length) {
			if(!commentsVm.commentsList()[index].allComments()[innerIndex].isHidden()) {
				if(commentsVm.commentsList()[index].allComments()[innerIndex].cState()){
					positive++;
				} else {
					negative++;
				}
			}
			innerIndex++;
		}
		index++;
	}
	commentsVm.allCountNegative(negative);
	commentsVm.allCountPositive(positive);
};

/*
	Searches a word entered by user
	Calls to an API
 */
Application.prototype.searchWord = function() {
	// make sure results are not shown to user before analysis is complete
	$(".all-comments").addClass("hidden");

	var searchWord = $(commentsApp.config.searchFieldId).val();
	// serach api
	commentsApp.searchRedditApi(searchWord);
};

/*
	Get latest comments from reddit api 
 */
Application.prototype.searchRedditApi = function(word) {
	var apiData = {};
	apiData.url = commentsApp.config.api[0].redditApi+"/search.json?q="+word;
	apiData.callback = commentsVm.bindComments;
	apiData.data = "";
	apiData.type = "get";
	if ( word.length > 2) {
		app.displayInfo("Please wait. Recieving comments");
		commentsApp.callAjax(apiData);
	} else {
		commentsApp.displayError("Search word is too short");
	}
};

/*
	Get comments from reddit api 
 */
Application.prototype.searchAllCommentsRedditApi = function(permalinkClean) {
	var apiData = {};
	apiData.url = permalinkClean+"/.json?";
	apiData.callback = commentsVm.bindAllComments;
	apiData.data = "";
	apiData.type = "get";
	app.displayInfo("Please wait. Recieving all comments");
	commentsApp.callAjax(apiData);
};


/*
	Get comments sentiments
	dataArray array A set of comments in a array data set
 */
Application.prototype.getSentiment = function (dataArray) {
	var apiData = {};
	apiData.url = commentsApp.config.api[1].sentimentApi;
	apiData.callback = commentsVm.bindSentiments;
	apiData.data = JSON.stringify(dataArray);

	apiData.type = "post";
	if ( dataArray.length > 0) {
		app.displayInfo("Please wait. Rating comments...");
		commentsApp.callAjax(apiData);
	} else {
		// calculate avarages
		app.calculateValues();
		// console.log("no data suppliec")
	}
};

/*
	Filter results by sentimetal type
	type String type to be filtered from the rest
 */
Application.prototype.filterResultsByType = function(type) {
	$(".all-children-comments").addClass("hidden");
	$(".all-children-comments"+type).removeClass("hidden");
};

/*
	Error report - Tell user if error occurs
	message String Message to be displayed
 */
Application.prototype.displayError = function(message) {
	$(".alert-danger").removeClass("hidden");
	$("#error-message").html(message);
	setTimeout(function() {
		$(".alert-danger").addClass("hidden");
	}, 5000);
};


/*
	User notify -Notify user what is going on
	message String Message to be displayed
 */
Application.prototype.displayInfo = function(message) {
	$(".alert-success").removeClass("hidden");
	$("#info-message").html(message);
	setTimeout(function() {
		$(".alert-success").addClass("hidden");
	}, 5000);
};

/*
	Ajax call

 */
Application.prototype.callAjax = function (ajaxData) {
	$.ajax({
		type: ajaxData.type,
		url: ajaxData.url,
		data: ajaxData.data,
		contentType: ajaxData.contentType,
		success: function(data) {
			// console.log(data);
			ajaxData.callback(data);
		},
		error: function(xhr, errorString, exception) {
			app.displayError("Networking error, please check your connection or invalid url supplied");
			//console.log("xhr.status="+xhr.status+" error="+errorString+" exception=("+exception+")");
		},
		complete: function(xhr, errorString, exception) {
			//console.log("xhr.status="+xhr.status+" error="+errorString+" exception=("+exception+")");
			if (xhr.status == 404) {
				alert("Sever file not found");
				app.displayError("Error : ", errorString);
			}else if (xhr.status == 500) {
				alert("Internal system error occured");
				app.displayError("Error : ", errorString);
			}
		},
	});
};
