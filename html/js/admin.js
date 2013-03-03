$('#update_candidate').tappable(function(el) {
	var name = $('#candidate_name_input').val();
	var position = $('#candidate_position_input').val();

	sockjs.send("ADMIN_SECRET_YOUVEBEENCAUGHTON:CANDIDATE_CHANGE:" + name + ":" + position);
});

$('#enable_button').tappable(function(el) {
	sockjs.send("ADMIN_SECRET_YOUVEBEENCAUGHTON:ENABLE_VOTING");
});

$('#disable_button').tappable(function(el) {
	sockjs.send("ADMIN_SECRET_YOUVEBEENCAUGHTON:DISABLE_VOTING");
});

$('#reset_vote').tappable(function(el) {
	sockjs.send("ADMIN_SECRET_YOUVEBEENCAUGHTON:RESET_VOTE");
});