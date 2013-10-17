isMarked = function($el) {
    if ($el.attr('data-marked')) {
        return true;
    } else {
        $el.attr('data-marked', true);
    }
};