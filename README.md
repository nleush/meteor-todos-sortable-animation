## How to use step-by-step

### 1. Include animtion.js

Just use this file in project to reuse drag-n-drop animations feature.

### 2. Create list item template with `data-id`

This will isolate item template and allows to identify each item.

    <template name="list">
        <div data-id="{{_id}}">
            ...
        </div>
    </template>

### 3. Create empty container for list items in list template

`{{#each ... }}` should not be used because of custom rendering method.

    <template name="lists">
        <div id="lists">
        </div>
    </template>
    
### 4. Create `rendered` event handler in list template

This step including following:

 1. Prevents multiple nonusefull `rendered` calls.
 2. Stops ovserver if template switched to another context.
 3. Defines items container.
 4. Defines items cursor.
 5. Defines item template.
 6. Defines method of updating order.

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
            }
        });

        this.handle = animation.observerHandle;
    };

## Known issues

### Full item rerender on change.

Inputs preservations will not work between binded data item changes.

I don't know yet how to rerender template using updated context data. So, for now,every time data is changed - old template deleted and new one created.

Anybody know to fix it?


### Prevent list item rerender on mousedown

`sortable` will work with element after mousedown. Don't make rerender events on mousedown, becuase `sortable` will not like it.

### Only first change shown as animation.

If many changes occurs - only first of them will be animated.
