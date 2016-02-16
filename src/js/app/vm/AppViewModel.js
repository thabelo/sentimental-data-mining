/* 
	compact global view models 
	Pager js Bind UI elements with knockout bindings
*/
var MainViewModel = {
	comments: new commentsViewModel()
};
/* KO -- Binding to contained models to all children of class=body [0] -- i like this :-) */
$(document).ready(function () {
    /* Enable under production */
	pager.extendWithPage(MainViewModel);
	ko.applyBindings(MainViewModel, $("#mainAppContainer")[0]);
	pager.start(MainViewModel);
});

/* ---- PROGRAM ENDS ----  */
