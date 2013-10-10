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

    var dragging = false;
    var tasksQueue = [];
    var observeHandle;
    var animation = 0;
    function startAnimation() {
        if (animation == 0) {
            items.sortable( "option", "disabled", true );
        }
        animation++;
    }
    function stopAnimation() {
        animation--;
        if (animation == 0) {
            items.sortable( "option", "disabled", false );
        }
    }

    var observer = {
        addedAt: function(document, atIndex, before) {

            if (dragging) {
                // TODO: update before!!
                tasksQueue.push(function() {
                    observer.addedAt(document, atIndex, before);
                });
                return;
            }

            var todoItem = Meteor.render(function() {
                return Template.todo_item(document);
            });

            if (before) {
                items.find('li[data-id="' + before + '"]').before(todoItem);
            } else {
                items.append(todoItem);
            }

            if (observeHandle) {
                // Initial ittems added. Manual adding - add animation.

                var $el = items.find('li[data-id="' + document._id + '"]');
                $el.hide();
                startAnimation();
                $el.slideDown(function() {
                    stopAnimation();
                });
            }
        },
        changed: function(newDocument, oldDocument) {

            if (dragging) {
                tasksQueue.push(function() {
                    observer.changed(newDocument, oldDocument);
                });
                return;
            }

            if (newDocument.text != oldDocument.text) {
                console.log('text');
            }
            if (newDocument.order != oldDocument.order) {
                console.log('order');
            }

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

            if (dragging) {
                tasksQueue.push(function() {
                    observer.removedAt(oldDocument, atIndex);
                });
                return;
            }

            var oldItem = items.find('li[data-id="' + oldDocument._id + '"]');

            oldItem.slideUp(function() {
                // Destroy template.
                // https://github.com/meteor/meteor/issues/392
                Spark.finalize(oldItem[0]);

                oldItem.remove();
            });
        },
        movedTo: function(document, fromIndex, toIndex, before) {

            if (dragging) {
                tasksQueue.push(function() {
                    observer.movedTo(document, fromIndex, toIndex, before);
                });
                return;
            }

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

                var itemsIndex = items.find('li');

                var fromIdxC, fromIdx = itemsIndex.index(item);
                var toIdxC, toIdx = itemsIndex.index(targetItem);
                var dir;

                console.log(fromIdx, toIdx)

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
                    startAnimation();
                    item.animate({
                        top: targetItem.offset().top - item.offset().top,
                        left: targetItem.offset().left - item.offset().left
                    } , 500 , "swing", function() {
                        stopAnimation();
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
    };

    // TODO: who will give context fro Template.todos.todos().
    observeHandle = this.handle = Template.todos.todos().observe(observer);

    items.sortable({
        axis: "y",
        start: function(event, ui) {
            dragging = true;
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
                console.log('update order');
                Todos.update(_id, {$set: {order: order}});
            }
            console.log('after stop');
            dragging = false;

            var task;
            while (task = tasksQueue.shift()) {
                task();
            }
        }
    });

    items.disableSelection();

};