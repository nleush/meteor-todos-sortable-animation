////////// Tracking selected list in URL //////////

var MainPageController = RouteController.extend({

    template: 'dashboard',

    run: function() {
        var list_id = this.params.list_id;
        var tag = this.params.tag && decodeURIComponent(this.params.tag);

        var oldList = Session.get("list_id");
        var oldTagFilter = Session.get("tag_filter");

        if (!list_id) {

            // Do nicer;
            routeToDefault();

        } else {
            var count = Lists.find({_id: list_id}).count();
            if (count == 0) {
                routeToDefault();
            } else if (oldList !== list_id || tag !== oldTagFilter) {
                Session.set("list_id", list_id);
                Session.set("tag_filter", tag);
            }
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
    this.route('online-users',{
        template: 'dashboard',
        renderTemplates: {
            'online_users_dialog': {to: 'modal'}
        }
    });
    this.route('online-users2',{
        template: 'dashboard',
        renderTemplates: {
            'online_users_dialog': {to: 'modal'}
        }
    });
    this.route('change-nickname',{
        template: 'dashboard',
        renderTemplates: {
            'username_dialog': {to: 'modal'}
        }
    });
    this.route('dashboard',{
        path: '/',
        controller: MainPageController
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