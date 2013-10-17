var updateUsername = function($input) {

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

    // TODO: go back?
    Router.go('dashboard');
};

Template.username_dialog.rendered = function() {

    this.$input = $(this.find("#username-input"));

    var $dialog = $(this.find("#username-dialog"));

    $dialog.modal();
};

Template.username_dialog.events({
    'keyup #username-input': function(evt, tmpl) {
        if (evt.keyCode === 13) {
            updateUsername(tmpl.$input);
        }
    },
    'click .btn-primary': function(evt, tmpl) {
        updateUsername(tmpl.$input);
    }
});