////////// Todos //////////

Template.todos.loading = function () {
    return todosHandle && !todosHandle.ready();
};

Template.todos.list_id = function() {
    var list_id = Session.get('list_id');
    var tag_filter = Session.get('tag_filter');

    return list_id + '-' + tag_filter;
};

Template.todos.any_list_selected = function () {
    return !Session.equals('list_id', null);
};

Template.todos.events(okCancelEvents(
    '#new-todo',
    {
        ok: function (text, evt) {
            var tag = Session.get('tag_filter');
            var first = Todos.findOne({}, {sort: {order: 1}});
            var order = first ? first.order - 1 : 0;
            Todos.insert({
                text: text,
                list_id: Session.get('list_id'),
                done: false,
                order: order,
                tags: tag ? [tag] : []
            });
            evt.target.value = '';
        }
    }));

Template.todos.todos = function () {
    // Determine which todos to display in main pane,
    // selected based on list_id and tag_filter.

    var list_id = Session.get('list_id');
    if (!list_id)
        return {};

    var sel = {list_id: list_id};
    var tag_filter = Session.get('tag_filter');
    if (tag_filter)
        sel.tags = tag_filter;

    return Todos.find(sel, {sort: {order: 1}});
};

Template.todos.rendered = function() {

    var items = this.find('ul');
    if (!items) {
        return;
    }

    var $items = $(items);

    var list_id = $items.attr('data-id');

    // Prevent multiple `rendered` calls on one list.
    // `rendered` called each time after `items.append`. Solve this by trigger.
    if (this.renderHackedFor == list_id) {
        return;
    }
    this.renderHackedFor = list_id;

    // Stop previous observer.
    // If only tag changes subscription is kept alive.
    if (this.handle) {
        this.handle.stop();
    }

    // [animation] Init animation.
    var animation = createSortableListAnimation({
        $items: $items,
        template: Template.todo_item,
        cursor: Template.todos.todos(),
        onSortableStop: function(event, ui) {
            var info = getItemOrderInfo(ui);
            if (info.oldOrder != info.order) {
                Todos.update(info._id, {$set: {order: info.order}});
            }
        }
    });

    this.handle = animation.observerHandle;
};