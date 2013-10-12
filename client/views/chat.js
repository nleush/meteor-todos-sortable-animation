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

Template.chat.events(okCancelEvents(
    '#new-chat-message-input',
    {
        ok: function (value, evt) {
            evt.target.value = '';
            var _id = Chat.insert({
                text: value,
                timestamp: new Date().getTime()
            });
            Meteor.call('refreshChatTime', _id);
        }
    }));