Template.username_button.events({
    'click .change-username-btn': function(e) {
        e.preventDefault();
        Session.set("editing_username", true);
    }
});