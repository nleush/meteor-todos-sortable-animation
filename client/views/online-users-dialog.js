Template.online_user.username = function() {
    var u = Meteor.users.findOne(this.userId);
    return u ? u.username : "unknown";
};

Template.online_users_dialog.users = function() {
    var presences = Meteor.presences.find({}).fetch();
    return _.uniq(presences, false, function(d) {return d.userId});
};

var hidden = function() {
    // TODO: make it smarter.
    routeToDefault();
};

Template.online_users_dialog.rendered = function() {
    var $dialog = this.$dialog = $(this.find("#online-users-dialog"));
    $dialog.modal();

    $dialog.off('hidden', hidden);
    $dialog.on('hidden', hidden);
};

Template.username_dialog.destroyed = function() {
    // !! Unsubscribe from hidden.
    this.$dialog.off('hidden', hidden);
    this.$dialog.modal('hide');
};