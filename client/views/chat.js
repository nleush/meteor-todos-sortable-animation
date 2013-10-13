Template.chat.loading = function () {
    return chatHandle && !chatHandle.ready();
};

Template.chat.items = function() {
    return Chat.find({}, {
        sort: {timestamp: -1},
        limit: 200
    });
};

Template.chat.time = function() {
    return moment(this.timestamp).format('hh:mm:ss');
};

Template.chat.online = function() {
    var presence = Meteor.presences.findOne({
        userId: this.created_by
    });
    return !!presence;
};

Template.chat.events(okCancelEvents(
    '#new-chat-message-input',
    {
        ok: function (value, evt) {
            evt.target.value = '';
            var user = Meteor.user();
            var _id = Chat.insert({
                created_by: user._id,
                created_by_name: user.username,
                text: value,
                timestamp: new Date().getTime()
            });
            Meteor.call('refreshChatTime', _id);
        }
    }));