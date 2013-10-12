
////////// Lists //////////

Template.lists.loading = function () {
    return !listsHandle.ready();
};

Template.lists.lists = function () {
    return Lists.find({}, {sort: {order: 1}});
};

// Attach events to keydown, keyup, and blur on "New list" input box.
Template.lists.events(okCancelEvents(
    '#new-list',
    {
        ok: function (text, evt) {
            var last = Lists.findOne({}, {sort: {order: -1}});
            var order = last ? last.order + 1 : 0;
            var id = Lists.insert({
                name: text,
                order: order
            });
            Router.setList(id);
            evt.target.value = "";
        }
    }));

Template.lists.rendered = function() {

    var items = this.find('.s-items');
    if (!items) {
        return;
    }

    var $items = $(items);

    // Prevent multiple `rendered` calls on one list.
    // `rendered` called each time after `items.append`. Solve this by trigger.
    if (this.renderHacked) {
        return;
    }
    this.renderHacked = true;

    // [animation] Init animation.
    var animation = createSortableListAnimation({
        el: 'div',
        $items: $items,
        template: Template.list,
        cursor: Template.lists.lists(),
        onSortableStop: function(event, ui) {
            var info = getItemOrderInfo(ui);
            if (info && info.oldOrder != info.order) {
                Lists.update(info._id, {$set: {order: info.order}});
            }
        }
    });

    this.handle = animation.observerHandle;
};