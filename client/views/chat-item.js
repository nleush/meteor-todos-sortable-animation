Template.chat_item.time = function() {
    return moment(this.timestamp).format('hh:mm:ss');
};

Template.chat_item.online = function() {
    var presence = Meteor.presences.findOne({
        userId: this.created_by
    });
    return !!presence;
};