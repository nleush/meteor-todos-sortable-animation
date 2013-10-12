createSortableListAnimation = function(options) {

    var template = options.template;
    var $items = options.$items;
    var cursor = options.cursor;
    var el = options.el || 'li'
    var onSortableStop = options.onSortableStop;

    var animation = new Animation({
        template: template,
        disableDragging: function() {
            $items.sortable("option", "disabled", true);
        },
        enableDragging: function() {
            $items.sortable("option", "disabled", false);
        },
        getNthItem: function(n) {
            return $items.find('>' + el + ':nth("' + n + '")');
        },
        getItemIndex: function($item) {
            var itemsIndex = $items.find('>' + el);
            return itemsIndex.index($item);
        },
        getItemById: function(id) {
            return $items.find('>' + el + '[data-id="' + id + '"]')
        },
        appendItem: function(item) {
            $items.append(item);
        }
    });

    var observer = animation.getObserverOptions();
    animation.observerHandle = cursor.observe(observer);
    animation.enableAddingAnimation = true;

    // Init sortable.
    $items.sortable({
        axis: "y",
        delay: 150,
        cursor: "move",
        start: function(event, ui) {
            // [animation] Disable dragging.
            animation.draggingStarted();
        },
        stop: function(event, ui) {
            onSortableStop(event, ui);

            // [animation] Enable dragging.
            animation.draggingStopped();
        }
    });
    $items.disableSelection();

    return animation;
};

Animation = function(options) {
    this.dragging = false;
    this.tasksQueue = [];
    this.animation = 0;
    this.animationDisabled = false;
    this.animationQueue = [];

    // Set from outside after observer created.
    this.enableAddingAnimation = false;

    // Mandatory params.
    this.disableDragging = options.disableDragging;
    this.enableDragging = options.enableDragging;
    this.template = options.template;
    this.getNthItem = options.getNthItem;
    this.getItemIndex = options.getItemIndex;
    this.getItemById = options.getItemById;
    this.appendItem = options.appendItem;
};

Animation.prototype.allowTask = function(task) {
    if (this.dragging) {
        this.tasksQueue.push(task);
        return false;
    } else if (this.animation > 0) {
        this.animationQueue.push(task);
        return false;
    }
    return true;
};

Animation.prototype.animationStarted = function () {
    if (this.animation == 0) {
        this.disableDragging();
    }
    this.animation++;
};

Animation.prototype.animationStopped = function () {
    this.animation--;
    if (this.animation == 0) {

        this.animationDisabled = true;
        var task;
        while(task = this.animationQueue.pop()) {
            task();
        }
        this.animationDisabled = false;

        this.enableDragging();
    }
};

Animation.prototype.draggingStarted = function () {
    this.dragging = true;
};

Animation.prototype.draggingStopped = function () {
    this.dragging = false;

    var task;
    while (task = this.tasksQueue.shift()) {
        task();
    }
};

Animation.prototype.getObserverOptions = function() {

    var self = this;

    var observer = {
        addedAt: function(document, atIndex, before) {

            if (!self.allowTask(function() {
                observer.addedAt(document, atIndex, before);
            })) {
                return;
            }

            var todoItem = Meteor.render(function() {
                return self.template(document);
            });

            if (before) {
                var beforeItem = self.getItemById(before);
                beforeItem.before(todoItem);
            } else {
                self.appendItem(todoItem)
            }

            if (self.enableAddingAnimation && !self.animationDisabled) {

                var $el = self.getItemById(document._id);
                $el.hide();
                self.animationStarted();
                $el.slideDown(function() {
                    self.animationStopped();
                });
            }
        },
        changed: function(newDocument, oldDocument) {

            // This is not animated, but respect other animations.

            if (!self.allowTask(function() {
                observer.changed(newDocument, oldDocument);
            })) {
                return;
            }
            // Full rerender item.

            // TODO: can we reinit current template context instead?
            // TODO: preserve input will not work.
            // TODO: animation blurs focus.

            var oldItem = self.getItemById(oldDocument._id);
            var newItem = Meteor.render(function() {
                return self.template(newDocument);
            });

            oldItem.after(newItem);

            // Destroy template.
            // https://github.com/meteor/meteor/issues/392
            Spark.finalize(oldItem[0]);

            oldItem.remove();
        },
        removedAt: function(oldDocument, atIndex) {

            if (!self.allowTask(function() {
                observer.removedAt(oldDocument, atIndex);
            })) {
                return;
            }

            var oldItem = self.getItemById(oldDocument._id);

            var task = function() {
                // Destroy template.
                // https://github.com/meteor/meteor/issues/392
                Spark.finalize(oldItem[0]);

                oldItem.remove();
            };

            if (self.animationDisabled) {
                task();
            } else {
                self.animationStarted();
                oldItem.slideUp(function() {
                    task();
                    self.animationStopped();
                });
            }
        },
        movedTo: function(document, fromIndex, toIndex, before) {

            if (!self.allowTask(function() {
                observer.movedTo(document, fromIndex, toIndex, before);
            })) {
                return;
            }

            var moveOperation;

            var item = self.getItemById(document._id);
            var fromIndex = self.getItemIndex(item);

            if (before) {
                var beforeItem = self.getItemById(before);
                moveOperation = function() {
                    beforeItem.before(item);
                };
            } else if (fromIndex != toIndex) {
                moveOperation = function() {
                    self.appendItem(item);
                };
            }

            if (moveOperation && fromIndex != toIndex) {

                if (self.animationDisabled) {

                    moveOperation();

                } else {

                    var targetItem = self.getNthItem(toIndex);
                    var fromIdxC, toIdxC, dir;

                    if (fromIndex > toIndex) {
                        // Move shifted items up.
                        fromIdxC = toIndex;
                        toIdxC = fromIndex - 1;
                        dir = 1;
                    } else if (fromIndex < toIndex) {
                        // Move shifted items down.
                        fromIdxC = fromIndex + 1;
                        toIdxC = toIndex;
                        dir = -1;
                    }

                    function moveItem(item, targetItem, cb) {
                        self.animationStarted();

                        var positionCss = item.css('position');
                        item.css('position', 'relative');
                        item.animate({
                            top: targetItem.offset().top - item.offset().top,
                            left: targetItem.offset().left - item.offset().left
                        } , 500 , "swing", function() {

                            item.css('position', positionCss);
                            item.css('top', '0');
                            item.css('left', '0');

                            cb && cb();

                            self.animationStopped();
                        });
                    }

                    for(var i = fromIdxC; i <= toIdxC; i++) {
                        var item1 = self.getNthItem(i);
                        var item2 = self.getNthItem(i + dir);
                        moveItem(item1, item2);
                    }

                    moveItem(item, targetItem, moveOperation);
                }
            }
        }
    };

    return observer;
};