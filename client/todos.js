////////// Todos //////////

Template.todos.loading = function () {
    return todosHandle && !todosHandle.ready();
};

Template.todos.list_id = function() {
    var list_id = Session.get('list_id');
    var tag_filter = Session.get('tag_filter');

    this.renderHacked = false;

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

    return Todos.find(sel, {sort: {order: 1, timestamp: -1}});
};

Template.todos.rendered = function() {

    var self = this;

    if (self.renderHacked) {
        return;
    }

    var items = self.find('ul');
    if (!items) {
        return;
    }

    items = $(items);

    // `rendered` called each time after `items.append`. Solve this by trigger.
    self.renderHacked = true;

    Template.todos.todos().observe({
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

        }
    });

    items.sortable({
        axis: "y",
        start: function(event, ui) {
            // TODO: Suspend updates.
        },
        end: function(event, ui) {
            // TODO: store position.
        }
    });
    items.disableSelection();

};