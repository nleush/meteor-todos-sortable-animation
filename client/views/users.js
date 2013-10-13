Template.users.count = function() {
    return Meteor.presences.find({}).count();
};