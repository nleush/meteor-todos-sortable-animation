Template.username_button.events({
    'click .change-username-btn': function(e) {
        Session.set("editing_username", true);
    }
});