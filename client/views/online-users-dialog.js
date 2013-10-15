Template.online_user.username = function() {
    var u = Meteor.users.findOne(this.userId);
    return u ? u.username : "unknown";
};

Template.online_users_dialog.users = function() {
    var presences = Meteor.presences.find({}).fetch();
    return _.uniq(presences, false, function(d) {return d.userId});
};

Template.online_users_dialog.rendered = function() {

    var $dialog = this.$dialog = $(this.find("#online-users-dialog"));
    var self = this;

    Deps.autorun(function() {
        var show = Session.get("online_users_dialog");
        var opened = $dialog.attr("opened");
        if (show) {
            if (!opened) {

                if (!$dialog.attr("inited")) {

                    // Not works.
                    self.rendered && self.rendered.dialog('destroy');

                    $dialog.attr("inited", true);
                    self.rendered = $dialog;

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
                }

                $dialog.dialog('open');

                $dialog.attr("opened", true);
            }
        } else {
            if (opened) {
                $dialog.dialog('close');
                $dialog.removeAttr("opened");
            }
        }
    });
};