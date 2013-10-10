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
    var handle = this.handle = Template.todos.todos().observe({
        addedAt: function(document, atIndex, before) {

            var todoItem = Meteor.render(function() {
                return Template.todo_item(document);
            });

            if (before) {
                items.find('li[data-id="' + before + '"]').before(todoItem);
            } else {
                items.append(todoItem);
            }

            if (handle) {
                // Initial ittems added. Manual adding - add animation.

                var $el = items.find('li[data-id="' + document._id + '"]');
                $el.hide();
                $el.slideDown();
            }
        },
        changedAt: function(newDocument, oldDocument, atIndex) {

            // Full rerender item.

            // TODO: can we reinit current template context?

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

            oldItem.slideUp(function() {
                // Destroy template.
                // https://github.com/meteor/meteor/issues/392
                Spark.finalize(oldItem[0]);

                oldItem.remove();
            });
        },
        movedTo: function(document, fromIndex, toIndex, before) {

            // TODO: Prevent move on mover side.
            // TODO: animated move other shifted items.

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

                var itemsIndex = items.find('li');

                var fromIdxC, fromIdx = itemsIndex.index(item);
                var toIdxC, toIdx = itemsIndex.index(targetItem);
                var dir;

                if (fromIdx > toIdx) {
                    // Move shifted items up.
                    fromIdxC = toIdx;
                    toIdxC = fromIdx - 1;
                    dir = 1;
                } else if (fromIdx < toIdx) {
                    // Move shifted items down.
                    fromIdxC = fromIdx + 1;
                    toIdxC = toIdx;
                    dir = -1;
                }

                function moveItem(item, targetItem, cb) {
                    item.animate({
                        top: targetItem.offset().top - item.offset().top,
                        left: targetItem.offset().left - item.offset().left
                    } , 500 , "swing", function() {
                        item.css('top', '0');
                        item.css('left', '0');
                        cb && cb();
                    });
                }

                for(var i = fromIdxC; i <= toIdxC; i++) {
                    var item1 = items.find('li:nth("' + i + '")');
                    var item2 = items.find('li:nth("' + (i + dir) + '")');
                    moveItem(item1, item2);
                }

                moveItem(item, targetItem, moveOperation);
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

            if (oldOrder != order)
                Todos.update(_id, {$set: {order: order}});
        }
    });
    items.disableSelection();

};