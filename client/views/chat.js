Template.chat.loading = function () {
    return chatHandle && !chatHandle.ready();
};

Template.chat.items = function() {
    return Chat.find({}, {
        sort: {timestamp: -1},
        limit: 200
    });
};

var MAX_CHAT = 600;

Template.chat.events(okCancelEvents(
    '#new-chat-message-input',
    {
        ok: function (value, evt) {
            evt.target.value = '';
            if (value.length > MAX_CHAT) {
                value = value.substr(0, 600) + '... [too big message trimmed]';
            }
            var user = Meteor.user();
            var _id = Chat.insert({
                created_by: user._id,
                created_by_name: user.username,
                text: value,
                timestamp: new Date().getTime()
            });
            Meteor.call('refreshChatTime', _id);
        }
    }, true));

Template.chat.rendered = function() {

    var items = this.find('.s-items');
    if (!items) {
        return;
    }

    var $items = $(items);

    // Prevent multiple `rendered` calls on one list.
    // `rendered` called each time after `items.append`. Solve this by trigger.
    if ($items.attr('rendered')) {
        return;
    }
    $items.attr('rendered', true);

    // [animation] Init animation.
    var animation = createSortableListAnimation({
        el: 'div',
        $items: $items,
        template: Template.chat_item,
        cursor: Template.chat.items(),
        animationSpeed: 200
    });

    this.handle = animation.observerHandle;
};