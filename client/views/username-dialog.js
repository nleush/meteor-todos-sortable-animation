var updateUsername = function(t) {

    var $input = t.$input;

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

    t.$dialog.modal('hide');
};

var shown = function() {
    $(this).find('#username-input').focus().select();
};

var hidden = function() {
    // TODO: make it smarter.
    routeToDefault();
};

Template.username_dialog.rendered = function() {

    var $dialog = this.$dialog = $(this.find("#username-dialog"));


    //==
    if ($dialog.attr('inited')) {
        return;
    }
    $dialog.attr('inited', true);
    //==


    this.$input = $(this.find("#username-input"));

    $dialog.modal();

    $dialog.off('shown', shown);
    $dialog.on('shown', shown);
    $dialog.off('hidden', hidden);
    $dialog.on('hidden', hidden);
};

Template.username_dialog.destroyed = function() {
    // !! Unsubscribe from hidden.
    this.$dialog.off('shown', shown);
    this.$dialog.off('hidden', hidden);
    this.$dialog.modal('hide');
};

Template.username_dialog.events({
    'keyup #username-input': function(evt, tmpl) {
        if (evt.keyCode === 13) {
            updateUsername(tmpl);
        }
    },
    'click .btn-primary': function(evt, tmpl) {
        updateUsername(tmpl);
    }
});