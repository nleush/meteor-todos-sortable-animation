// Override router to wait for animated modals.

var nativeGo = Router.go;
Router.go = function() {
    var that = this;
    var args = arguments;
    Modal.destroyModals(function() {
        nativeGo.apply(that, args);
    });
};

// Modal helper class.

Modal = function(options) {
    this.$modal = options.$modal;
    this.shownCb = options.shown;
    this.hiddenCb = options.hidden;
    this.state = Modal.STATES.hidden;

    _.bindAll(this, "_show", "_shown", "_hide", "_hidden");

    this.$modal.on('show', this._show);
    this.$modal.on('shown', this._shown);
    this.$modal.on('hide', this._hide);
    this.$modal.on('hidden', this._hidden);

    this.$modal.modal();

    Modal._activeModals.push(this);
};

Modal.STATES = {
    showing: 0,
    shown: 1,
    hiding: 2,
    hidden: 3
};

Modal.destroyModals = function(cb) {
    var destroyedCount = 0;
    var finished = false;
    function destroyed() {
        destroyedCount--;
        check();
    }
    function check() {
        if (destroyedCount == 0 && finished) {
            cb();
        }
    }
    var modal;
    while(modal = this._activeModals.shift()) {
        destroyedCount++;
        modal.destroy(destroyed);
    }
    var finished = true;
    check();
};

Modal.prototype.hide = function() {
    // Just hide with events.
    this.$modal.modal('hide');
};

Modal.prototype.destroy = function(cb) {
    // Hide without 'hidden' event, used in template.destroyed.
    this._unbind();

    if (this.state == Modal.STATES.hidden) {
        cb && cb();
    } else {
        cb && this.$modal.on('hidden', cb)
        this.$modal.modal('hide');
    }
};

// ============= Private ===============

Modal._activeModals = [];

Modal.prototype._show = function() {
    this.state = Modal.STATES.showing;
};

Modal.prototype._shown = function() {
    this.state = Modal.STATES.shown;

    this.shownCb && this.shownCb();
};

Modal.prototype._hide = function() {
    this.state = Modal.STATES.hiding;
};

Modal.prototype._hidden = function() {
    this.state = Modal.STATES.hidden;

    this.hiddenCb && this.hiddenCb();
};

Modal.prototype._unbind = function() {
    this.$modal.off('show', this._shown);
    this.$modal.off('shown', this._shown);
    this.$modal.off('hide', this._hidden);
    this.$modal.off('hidden', this._hidden);
};