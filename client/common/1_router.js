////////// Tracking selected list in URL //////////

TodosRouter = function() {
    this.route('dashboard-list',{
        path: '/:list_id',
        handler: function() {
            var list_id = this.params.list_id;
            var oldTagFilter = Session.get("tag_filter");
            var oldList = Session.get("list_id");

            if (oldList !== list_id || oldTagFilter !== null) {

                Session.set("list_id", list_id);
                Session.set("tag_filter", null);
            }
        }
    });
    this.route('dashboard-list-tag',{
        path: '/:list_id/:tag',
        handler: function() {
            var list_id = this.params.list_id;
            var tag = decodeURIComponent(this.params.tag);

            var oldList = Session.get("list_id");
            var oldTagFilter = Session.get("tag_filter");

            if (oldList !== list_id || tag !== oldTagFilter) {

                Session.set("list_id", list_id);
                Session.set("tag_filter", tag);
            }
        }
    });
};