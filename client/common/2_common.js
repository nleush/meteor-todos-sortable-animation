Meteor.startup(function() {
    Deps.autorun(function() {
        var user = Meteor.user();

        if (!user) {
            Meteor.call('initUser', function(error, id) {
                Meteor.loginWithPassword(id, 'password');
            });
        }
    });
});

// Define Minimongo collections to match server/publish.js.
Lists = new Meteor.Collection("lists");
Todos = new Meteor.Collection("todos");
Chat = new Meteor.Collection("chat");

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

// When edit username popup.
Session.setDefault('editing_username', null);

Router.map(TodosRouter);
Router.setList = function (list_id, tag) {
    if (tag) {
        Router.go("dashboard-list-tag", {list_id: list_id, tag: tag});
    } else {
        Router.go("dashboard-list", {list_id: list_id});
    }
}

routeToDefault = function() {
    var list = Lists.findOne({}, {sort: {order: 1}});

    if (list) {
        Router.setList(list._id);
    }
};

// Subscribe to 'lists' collection on startup.
// Select a list once data has arrived.
listsHandle = Meteor.subscribe('lists', function () {
    var list_id = Session.get('list_id');

    if (!list_id) {
        routeToDefault();
    } else {
        var count = Lists.find({_id: list_id}).count();
        if (count == 0) {
            routeToDefault();
        }
    }
});

Deps.autorun(function() {
    var list_id = Session.get('list_id');
    var count = Lists.find({_id: list_id}).count();
    if (count == 0) {
        routeToDefault();
    }
});

chatHandle = Meteor.subscribe('chat');
Meteor.subscribe('userPresence');

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
okCancelEvents = function (selector, callbacks, disabeFocusout) {
    var ok = callbacks.ok || function () {};
    var cancel = callbacks.cancel || function () {};

    var events = {};
    events['keyup '+selector+', keydown '+selector + (disabeFocusout? '' : ', focusout '+selector)] =
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

getItemOrderInfo = function(ui) {
    var el = ui.item.get(0);

    var context = Spark.getDataContext(el);
    if (!context) {
        return null;
    }
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

    return {
        order: order,
        oldOrder: oldOrder,
        _id: _id
    };
};