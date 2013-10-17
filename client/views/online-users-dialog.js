Template.online_user.username = function() {
    var u = Meteor.users.findOne(this.userId);
    return u ? u.username : "unknown";
};

Template.online_users_dialog.users = function() {
    var presences = Meteor.presences.find({}).fetch();
    return _.uniq(presences, false, function(d) {return d.userId});
};

Template.online_users_dialog.rendered = function() {
    var $dialog = $(this.find("#online-users-dialog"));
    $dialog.modal();
};