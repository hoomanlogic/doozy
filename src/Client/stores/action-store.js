(function (factory) {
    module.exports = exports = factory(
        require('./gnode-store'),
        require('hl-common-js/src/those')
    );
}(function (gnodeStore, those) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var actionStore = new gnodeStore.GnodeStore('Action');

    var cleanActionName = function (name) {
        return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase(); // eslint-disable-line no-regex-spaces
    };

    actionStore.getActionByName = function (name) {
        var existingAction = those(actionStore.context({}).value).first(function (item) {
            return cleanActionName(item.name) === cleanActionName(name.toLowerCase());
        });
        return existingAction;
    };

    // Export instance
    return actionStore;
}));
