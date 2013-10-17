Template.username_button.events({
    'click .change-username-btn': function(e) {
        e.preventDefault();

        // TODO: reuse.
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('openDialog', false, false, null);
        $('#username-dialog')[0].dispatchEvent(evt);
    }
});