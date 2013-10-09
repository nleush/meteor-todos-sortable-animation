
////////// Tracking selected list in URL //////////

var TodosRouter = Backbone.Router.extend({
    routes: {
        ":list_id": "main",
        ":list_id/:tag": "main"
    },
    main: function (list_id, tag) {
        var oldList = Session.get("list_id");
        var oldTagFilter = Session.get("tag_filter");
        if (oldList !== list_id || tag !== oldTagFilter) {
            Session.set("list_id", list_id);
            Session.set("tag_filter", tag || null);
        }
    },
    setList: function (list_id, tag) {
        if (tag) {
            this.navigate(list_id + "/" + tag, true);
        } else {
            this.navigate(list_id, true);
        }
    }
});

Router = new TodosRouter;

Meteor.startup(function () {
    Backbone.history.start({pushState: true});
});
