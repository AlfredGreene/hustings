$('#update_candidate').tappable(function(el) {
	var name = $('#candidate_name_input').val();
	var position = $('#candidate_position_input').val();

	alert(name + " " + position);

	sockjs.send("CANDIDATE_CHANGE:" + name + ":" + position);
});

$('#enable_button').tappable(function(el) {
	sockjs.send("ENABLE_VOTING");
});

$('#disable_button').tappable(function(el) {
	sockjs.send("DISABLE_VOTING");
});