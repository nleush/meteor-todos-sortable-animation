Template.list.events({
    'click .list': function (evt) {
        // prevent clicks on <a> from refreshing the page.
        evt.preventDefault();

        var $el = $(evt.target);

        if ($el.hasClass('destroy')) {
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

Template.list.selected = function () {
    return Session.equals('list_id', this._id) ? 'selected' : '';
};

Template.list.name_class = function () {
    return this.name ? '' : 'empty';
};

Template.list.editing = function () {
    return Session.equals('editing_listname', this._id);
};