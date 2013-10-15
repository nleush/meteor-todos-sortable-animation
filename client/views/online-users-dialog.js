Template.online_user.username = function() {
    var u = Meteor.users.findOne(this.userId);
    return u ? u.username : "unknown";
};

Template.online_users_dialog.users = function() {
    var presences = Meteor.presences.find({}).fetch();
    return _.uniq(presences, false, function(d) {return d.userId});
};

Template.online_users_dialog.rendered = function() {

    if (this.$dialog) {
        // Prevent dialog reinit.
        return;
    }

    var $dialog = this.$dialog = $(this.find("#online-users-dialog"));

    $dialog.dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        height: 500,
        width: 200,
        show: {
            effect: "scale",
            duration: 500
        },
        hide: {
            effect: "scale",
            duration: 500
        },
        close: function( event, ui ) {
            Session.set("online_users_dialog", false);
        }
    });

    Deps.autorun(function() {
        var show = Session.get("online_users_dialog");
        var opened = $dialog.dialog("isOpen");
        if (show) {
            if (!opened) {
                $dialog.dialog('open');
            }
        } else {
            if (opened) {
                $dialog.dialog('close');
            }
        }
    });
};