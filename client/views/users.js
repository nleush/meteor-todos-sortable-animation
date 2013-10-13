Template.users.count = function() {
    return userPresence.find({}).count();
};