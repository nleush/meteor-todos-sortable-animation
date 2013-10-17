Template.users.count = function() {
    var presences = Meteor.presences.find({}).fetch();
    presences =  _.uniq(presences, false, function(d) {return d.userId});
    return presences.length;
};