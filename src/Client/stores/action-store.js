(function (factory) {
    module.exports = exports = factory(
        require('./gnode-store')
    );
}(function (gnodeStore) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var actionStore = new gnodeStore.GnodeStore('Action');

    // Export instance
    return actionStore;
}));
