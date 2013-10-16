Template.online_user.username = function() {
    var u = Meteor.users.findOne(this.userId);
    return u ? u.username : "unknown";
};

Template.online_users_dialog.users = function() {
    var presences = Meteor.presences.find({}).fetch();
    return _.uniq(presences, false, function(d) {return d.userId});
};

Template.online_users_dialog.rendered = function() {

};

Template.online_users_dialog.events({
    'openDialog #online-users-dialog': function(e, t) {

        var $dialog = $(t.find("#online-users-dialog"));
        var opened = $dialog.attr("opened");
        if (!opened) {

//            if (!$dialog.attr("inited")) {

                $dialog.attr("inited", true);

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
                        $dialog.removeAttr("opened");
                    }
                });
//            }

            $dialog.dialog('open');

            $dialog.attr("opened", true);
        }
    },
    'closeDialog #online-users-dialog': function(e, t) {

        var $dialog = $(t.find("#online-users-dialog"));
        var opened = $dialog.attr("opened");

        if (opened) {
            $dialog.dialog('close');
            $dialog.removeAttr("opened");
        }
    }
});