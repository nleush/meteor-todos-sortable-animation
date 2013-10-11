////////// Tag Filter //////////

// Pick out the unique tags from all todos in current list.
Template.tag_filter.tags = function () {
    var tag_infos = [];
    var total_count = 0;

    Todos.find({list_id: Session.get('list_id')}).forEach(function (todo) {
        _.each(todo.tags, function (tag) {
            var tag_info = _.find(tag_infos, function (x) { return x.tag === tag; });
            if (! tag_info)
                tag_infos.push({tag: tag, count: 1});
            else
                tag_info.count++;
        });
        total_count++;
    });

    tag_infos = _.sortBy(tag_infos, function (x) { return x.tag; });
    tag_infos.unshift({tag: null, count: total_count});

    return tag_infos;
};

Template.tag_filter.tag_text = function () {
    return this.tag || "All items";
};

Template.tag_filter.selected = function () {
    return Session.equals('tag_filter', this.tag) ? 'selected' : '';
};

Template.tag_filter.events({
    'mousedown .tag': function () {
        if (Session.equals('tag_filter', this.tag)) {
            Router.setList(Session.get('list_id'));
        } else {
            Router.setList(Session.get('list_id'), this.tag);
        }
    }
});