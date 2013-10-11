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
    var animation = new Animation({
        template: Template.todo_item,
        disableDragging: function() {
            $items.sortable("option", "disabled", true);
        },
        enableDragging: function() {
            $items.sortable("option", "disabled", false);
        },
        getNthItem: function(n) {
            return $items.find('li:nth("' + n + '")');
        },
        getItemIndex: function($item) {
            var itemsIndex = $items.find('li');
            return itemsIndex.index($item);
        },
        getItemById: function(id) {
            return $items.find('li[data-id="' + id + '"]')
        },
        appendItem: function(item) {
            $items.append(item);
        }

    });
    var observer = animation.getObserverOptions();

    // TODO: who will give context for Template.todos.todos().
    // [animation] Init `observeHandle` to indicate manual adding items.
    this.handle = Template.todos.todos().observe(observer);
    animation.enableAddingAnimation = true;

    // Init sortable.
    $items.sortable({
        axis: "y",
        start: function(event, ui) {
            // [animation] Disable dragging.
            animation.disableDragging();
        },
        stop: function(event, ui) {

            var el = ui.item.get(0);

            var context = Spark.getDataContext(el);
            var _id = context._id
            var oldOrder = context.order;

            var before = ui.item.prev().get(0);
            var after = ui.item.next().get(0);


            var order;
            if (!before && after) {
                order = Spark.getDataContext(after).order - 1;
            } else if (!after && before) {
                order = Spark.getDataContext(before).order + 1;
            } else if (after && before) {
                order = (Spark.getDataContext(before).order + Spark.getDataContext(after).order) / 2;
            }

            if (oldOrder != order) {
                Todos.update(_id, {$set: {order: order}});
            }

            // [animation] Enable dragging.
            animation.enableDragging();
        }
    });

    $items.disableSelection();

};