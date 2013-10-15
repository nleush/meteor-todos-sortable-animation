Template.header.events({
    'click .s-page-todos': function(e) {
        e.preventDefault();
        routeToDefault();
    },
    'click .s-page-tiles': function(e) {
        e.preventDefault();
        Router.go("tiles");
    }
});