Template.list.created = function() {
    this.handle = Meteor.subscribe('todos', this.data._id);
};

Template.list.destroyed = function() {
    this.handle.stop();
};

Template.list.events({
    'click .list': function (evt, tmpl) {
        // prevent clicks on <a> from refreshing the page.
        evt.preventDefault();

        var $el = $(evt.target);

        if ($el.hasClass('destroy')) {

            var count = Todos.find({
                list_id: tmpl.list_id
            }).count();
            if (count) {
                return alert('Only empty list can be removed! Remove all todos first.');
            }

            Lists.remove(this._id);
            // TODO: remove child todos.
        } else {
            Router.setList(this._id);
        }
    },
    'dblclick .list': function (evt, tmpl) { // start editing list name
        Session.set('editing_listname', this._id);
        Deps.flush(); // force DOM redraw, so we can focus the edit field
        activateInput(tmpl.find("#list-name-input"));
    }
});

Template.list.events(okCancelEvents(
    '#list-name-input',
    {
        ok: function (value) {
            Lists.update(this._id, {$set: {name: value}});
            Session.set('editing_listname', null);
        },
        cancel: function () {
            Session.set('editing_listname', null);
        }
    }));

Template.list.can_delete = function () {
    var count = Todos.find({
        list_id: this._id
    }).count();
    return !this.good && count == 0;
};

Template.list.selected = function () {
    return Session.equals('list_id', this._id) ? 'selected' : '';
};

Template.list.name_class = function () {
    return this.name ? '' : 'empty';
};

Template.list.editing = function () {
    return Session.equals('editing_listname', this._id);
};