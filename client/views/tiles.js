Template.tiles.tiles = function() {
    return Tiles.find({}, {sort: {order: 1}});
};

Template.tiles.rendered = function() {

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
        template: Template.tile,
        cursor: Template.tiles.tiles(),
        sortableOptions: {
            delay: 0,
            axis: null
        },
        animationSpeed: 700,
        onSortableStop: function(event, ui) {
            var info = getItemOrderInfo(ui);
            if (info && info.oldOrder != info.order) {
                Tiles.update(info._id, {$set: {order: info.order}});
            }
        }
    });

    this.handle = animation.observerHandle;
};