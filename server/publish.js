// Lists -- {name: String}
Lists = new Meteor.Collection("lists");
Chat = new Meteor.Collection("chat");

Meteor.publish('chat', function () {
    return Chat.find({}, {
        sort: {timestamp: -1},
        limit: 200
    });
});

// Publish complete set of lists to all clients.
Meteor.publish('lists', function () {
  return Lists.find();
});


// Todos -- {text: String,
//           done: Boolean,
//           tags: [String, ...],
//           list_id: String,
//           timestamp: Number}
Todos = new Meteor.Collection("todos");

// Publish all items for requested list_id.
Meteor.publish('todos', function (list_id) {
    check(list_id, String);
    return Todos.find({list_id: list_id});
});

Meteor.publish('userPresence', function() {
    // Setup some filter to find the users your logged in user
    // cares about. It's unlikely that you want to publish the
    // presences of _all_ the users in the system.
    var filter = {};

    // ProTip: unless you need it, don't send lastSeen down as it'll make your
    // templates constantly re-render (and use bandwidth)
    return Meteor.presences.find(filter, {fields: {state: true, userId: true}});
});


// TODO: validate all fields.

Lists.allow({
    insert: function(userId, doc) {
        if (doc.name.length > 33) {
            return false;
        }
        return Lists.find().count() < 20;
    },
    update: function(userId, doc) {
        if (doc.name.length > 33) {
            return false;
        } else {
            return true;
        }
    }
});

Todos.allow({
    insert: function(userId, doc) {
        if (doc.text.length > 60) {
            return false;
        }
        if (Lists.find({_id: doc.list_id}).count() == 0) {
            return false;
        }

        return Todos.find({list_id: doc.list_id}).count() < 20;
    },
    update: function(userId, doc) {
        if (doc.text.length > 60) {
            return false;
        }

        return true;
    }
});

Chat.allow({
    insert: function(userId, doc) {
        if (doc.text.length > 700) {
            return false;
        }
        return true;
    },
    update: function(userId, doc) {
        if (doc.text.length > 700) {
            return false;
        }
        return true;
    }
});