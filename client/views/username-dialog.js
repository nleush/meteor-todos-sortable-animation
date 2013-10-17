var updateUsername = function($input, $dialog) {

    var value = $.trim($input.val());
    if (!value) {
        return;
    }

    if (value.length > 14) {
        alert('Too long nickname');
        return;
    }

    var existing = Meteor.users.findOne({username: value, _id: {$ne: Meteor.userId()}});

    if (existing) {
        alert('Nickname used by another user :(');
        return;
    }

    Meteor.users.update({_id: Meteor.userId()}, {
        $set: {
            username: value
        }
    });

    $dialog.dialog('close');
};

Template.username_dialog.rendered = function() {
    this.$input = $(this.find("#username-input"));
    this.$dialog = $(this.find("#username-dialog"));
};


Template.username_dialog.events({
    'keyup #username-input': function(evt, tmpl) {
        if (evt.keyCode === 13) {
            updateUsername(tmpl.$input, tmpl.$dialog);
        }
    },
    'openDialog #username-dialog': function(e, t) {

        var $dialog = $(t.find("#username-dialog"));
        var opened = $dialog.attr("opened");
        if (!opened) {

            //if (!$dialog.attr("inited")) {

                $dialog.attr("inited", true);

                $dialog.dialog({
                    autoOpen: false,
                    modal: true,
                    resizable: false,
                    show: {
                        effect: "scale",
                        duration: 500
                    },
                    hide: {
                        effect: "scale",
                        duration: 500
                    },
                    open: function() {
                        t.$input.focus();
                        t.$input.select();
                    },
                    buttons: [
                        {
                            text: "Update",
                            click: function() {
                                updateUsername(t.$input);
                            }
                        }
                    ],
                    close: function( event, ui ) {
                        $dialog.removeAttr("opened");
                    }
                });
            //}

            $dialog.dialog('open');

            $dialog.attr("opened", true);
        }
    },
    'closeDialog #username-dialog': function(e, t) {

        var $dialog = $(t.find("#online-users-dialog"));
        var opened = $dialog.attr("opened");

        if (opened) {
            $dialog.dialog('close');
        }
    }
});