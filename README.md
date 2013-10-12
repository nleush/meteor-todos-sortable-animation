# Meteor "todos" example with drag-n-drop and animation

This is modified [todos](http://www.meteor.com/examples/todos) Meteor example.

Following features added:

 1. [sortable](http://jqueryui.com/sortable/) from jquery-ui used for drag-n-drop todos and todo lists.
 2. Sorting animation displayed on other application clients while sorting.
 3. Remove and add animation added.
 4. Added url routing for tags filtering (just for fun).

I hope this feature will be added soon in Meteor in native way, as was written here: 
[Previewing Meteor's new rendering engine: reactive sortable lists](http://www.meteor.com/blog/2013/09/13/previewing-meteors-new-rendering-engine-reactive-sortable-lists) by Avital Oliver

I need it now, so had to implement something similar. I have only week of Meteor using experience, so any help or criticism will be appriciated.

## How to use step-by-step
 
### 1. Include animtion.js

Use [animation.js](../master/client/common/animation.js) file in your project to reuse drag-n-drop animations feature.

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

 1. Prevents multiple useless `rendered` calls.
 2. Stops observer if template switched to another context.
 3. Defines items container.
 4. Defines items cursor.
 5. Defines item template.
 6. Defines method of updating order.

Example for todos:

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

Not actually issue but can be odd: if many changes occurs - only first of them will be animated.

## Roadmap

Also I want to implement following in next steps:

 1. Add list remove button (with removing todos and redirecting other watching that clients).
 2. Use [Iron Router](/EventedMind/iron-router).
 3. Create animated popup for editing something.

## Contribute

I'll be glad to receive any feedback or help on it. Fill free to make forks or issues.
