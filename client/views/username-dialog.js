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

    t.modal.hide();
};

Template.username_dialog.rendered = function() {

    this.$modal = $(this.find("#username-dialog"));

    // Prevent reinit.
    if (isMarked(this.$modal)) {
        return;
    }

    var $input = this.$input = $(this.find("#username-input"));

    this.modal = new Modal({
        $modal: this.$modal,
        shown: function() {
            $input.focus().select();
        },
        hidden: function() {
            // TODO: make it smarter.
            routeToDefault();
        }
    });
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