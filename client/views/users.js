Template.users.count = function() {
    var presences = Meteor.presences.find({}).fetch();
    presences =  _.uniq(presences, false, function(d) {return d.userId});
    return presences.length;
};

Template.users.events({
    'click .show-online-users': function(e) {
        e.preventDefault();

        // TODO: reuse.
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent('openDialog', false, false, null);
        $('#online-users-dialog')[0].dispatchEvent(evt);
    }
});