// Client-side JavaScript, bundled and sent to client.

// Define Minimongo collections to match server/publish.js.
Lists = new Meteor.Collection("lists");
Todos = new Meteor.Collection("todos");
TodosLocal = new Meteor.Collection(null);

// ID of currently selected list
Session.setDefault('list_id', null);

// Name of currently selected tag for filtering
Session.setDefault('tag_filter', null);

// When adding tag to a todo, ID of the todo
Session.setDefault('editing_addtag', null);

// When editing a list name, ID of the list
Session.setDefault('editing_listname', null);

// When editing todo text, ID of the todo
Session.setDefault('editing_itemname', null);

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
listsHandle = Meteor.subscribe('lists', function () {
    if (!Session.get('list_id')) {
        var list = Lists.findOne({}, {sort: {name: 1}});
        if (list)
            Router.setList(list._id);
    }
});

todosHandle = null;
// Always be subscribed to the todos for the selected list.
Deps.autorun(function () {
    var list_id = Session.get('list_id');
    if (list_id) {
        todosHandle = Meteor.subscribe('todos', list_id);
    } else
        todosHandle = null;
});

////////// Helpers for in-place editing //////////

// Returns an event map that handles the "escape" and "return" keys and
// "blur" events on a text input (given by selector) and interprets them
// as "ok" or "cancel".
okCancelEvents = function (selector, callbacks) {
    var ok = callbacks.ok || function () {};
    var cancel = callbacks.cancel || function () {};

    var events = {};
    events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
        function (evt) {
            if (evt.type === "keydown" && evt.which === 27) {
                // escape = cancel
                cancel.call(this, evt);

            } else if (evt.type === "keyup" && evt.which === 13 ||
                evt.type === "focusout") {
                // blur/return/enter = ok/submit if non-empty
                var value = String(evt.target.value || "");
                if (value)
                    ok.call(this, value, evt);
                else
                    cancel.call(this, evt);
            }
        };

    return events;
};

activateInput = function (input) {
    input.focus();
    input.select();
};