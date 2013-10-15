Template.users.count = function() {
    var presences = Meteor.presences.find({}).fetch();
    presences =  _.uniq(presences, false, function(d) {return d.userId});
    return presences.length;
};

Template.users.events({
    'click .show-online-users': function(e) {
        e.preventDefault();
        Session.set("online_users_dialog", true);
    }
});