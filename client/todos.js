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
            Todos.insert({
                text: text,
                list_id: Session.get('list_id'),
                done: false,
                timestamp: (new Date()).getTime(),
                order: 0,
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

    items = $(items);

    var list_id = items.attr('data-id');

    if (this.renderHackedFor == list_id) {
        return;
    }

    // `rendered` called each time after `items.append`. Solve this by trigger.
    this.renderHackedFor = list_id;

    // Stop previous observer.
    // If only tag changes subscription is kept alive.
    if (this.handle) {
        this.handle.stop();
    }

    // TODO: who will give context fro Template.todos.todos().
    this.handle = Template.todos.todos().observe({
        addedAt: function(document, atIndex, before) {

            var todoItem = Meteor.render(function() {
                return Template.todo_item(document);
            });

            if (before) {
                items.find('li[data-id="' + before + '"]').before(todoItem);
            } else {
                items.append(todoItem);
            }
        },
        changedAt: function(newDocument, oldDocument, atIndex) {

            var oldItem = items.find('li[data-id="' + oldDocument._id + '"]:last');
            var newItem = Meteor.render(function() {
                return Template.todo_item(newDocument);
            });

            oldItem.after(newItem);

            // Destroy template.
            // https://github.com/meteor/meteor/issues/392
            Spark.finalize(oldItem[0]);

            oldItem.remove();
        },
        removedAt: function(oldDocument, atIndex) {

            var oldItem = items.find('li[data-id="' + oldDocument._id + '"]');

            // Destroy template.
            // https://github.com/meteor/meteor/issues/392
            Spark.finalize(oldItem[0]);

            oldItem.remove();
        },
        movedTo: function(document, fromIndex, toIndex, before) {

            // TODO: Prevent move on mover side.

            var moveOperation;

            var item = items.find('li[data-id="' + document._id + '"]');
            if (before) {
                var beforeItem = items.find('li[data-id="' + before + '"]');
                moveOperation = function() {
                    beforeItem.before(item);
                };
            } else {
                var lastItem = items.find('li[data-id]:last');
                if (lastItem.length && lastItem.attr('data-id') != document._id) {
                    moveOperation = function() {
                        lastItem.after(item);
                    }
                }
            }

            if (moveOperation) {
                var targetItem = items.find('li:nth("' + toIndex + '")');
                item.animate({
                    top: targetItem.offset().top - item.offset().top,
                    left: targetItem.offset().left - item.offset().left
                } , 200 , "swing", function() {
                    item.css('top', '0');
                    item.css('left', '0');
                    moveOperation();
                });
            }

        }
    });

    items.sortable({
        axis: "y",
        start: function(event, ui) {
            // TODO: Suspend updates.
            //console.log('start',ui);
        },
        beforeStop: function(event, ui) {

        },
        stop: function(event, ui) {

            var el = ui.item.get(0);

            var _id = Spark.getDataContext(el)._id

            var before = ui.item.prev().get(0);
            var after = ui.item.next().get(0);

            var order;
            if (!before) {
                order = Spark.getDataContext(after).order - 1;
            } else if (!after) {
                order = Spark.getDataContext(before).order + 1;
            } else {
                order = (Spark.getDataContext(before).order + Spark.getDataContext(after).order) / 2;
            }

            Todos.update(_id, {$set: {order: order}});
        }
    });
    items.disableSelection();

};