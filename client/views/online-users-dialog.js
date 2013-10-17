Template.online_user.username = function() {
    var u = Meteor.users.findOne(this.userId);
    return u ? u.username : "unknown";
};

Template.online_users_dialog.users = function() {
    var presences = Meteor.presences.find({}).fetch();
    return _.uniq(presences, false, function(d) {return d.userId});
};

Template.online_users_dialog.rendered = function() {

    this.$modal = $(this.find("#online-users-dialog"));

    // Prevent reinit.
    if (isMarked(this.$modal)) {
        return;
    }

    this.modal = new Modal({
        $modal: this.$modal,
        hidden: function() {
            // TODO: make it smarter.
            routeToDefault();
        }
    });
};

Template.online_users_dialog.destroyed = function() {
    console.log('udd');
    this.modal.destroy();
};