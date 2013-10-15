Template.chat_item.time = function() {
    return moment(this.timestamp).format('hh:mm:ss');
};

Template.chat_item.online = function() {
    var presence = Meteor.presences.findOne({
        userId: this.created_by
    });
    return !!presence;
};

Template.chat_item.can_delete = function() {
    var user = Meteor.user();
    return user.username == "admin";
};

Template.chat_item.username = function() {
    var user = Meteor.users.findOne({_id: this.created_by});
    if (user) {
        return user.username;
    } else {
        return this.created_by_name;
    }
}

Template.chat_item.events({
    "click .s-delete": function(evt) {
        evt.preventDefault();

        Chat.remove(this._id);
    }
});