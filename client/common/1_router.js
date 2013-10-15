////////// Tracking selected list in URL //////////

var MainPageController = RouteController.extend({

    template: 'dashboard',

    run: function() {
        var list_id = this.params.list_id;
        var tag = this.params.tag && decodeURIComponent(this.params.tag);

        var oldList = Session.get("list_id");
        var oldTagFilter = Session.get("tag_filter");

        if (oldList !== list_id || tag !== oldTagFilter) {
            Session.set("list_id", list_id);
            Session.set("tag_filter", tag);
        }
        this.render();
    }
});

var TilesPageController = RouteController.extend({

    template: 'tiles',

    run: function() {
        this.render();
    }
});

TodosRouter = function() {
    this.route('tiles',{
        path: '/tiles',
        controller: TilesPageController
    });
    this.route('dashboard-list',{
        path: '/:list_id',
        controller: MainPageController
    });
    this.route('dashboard-list-tag',{
        path: '/:list_id/:tag',
        controller: MainPageController
    });
};

Router.configure({
    layout: 'layout'
});