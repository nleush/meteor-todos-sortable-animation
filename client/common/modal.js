Modal = function(options) {
    this.$modal = options.$modal;
    this.shown = options.shown;
    this.hidden = options.hidden;

    this.$modal.modal();

    if (this.shown)
        this.$modal.on('shown', this.shown);
    this.$modal.on('hidden', this.hidden);
};


Modal.prototype.destroy = function() {
    this.$modal.modal('hide');
};