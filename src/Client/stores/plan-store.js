(function (factory) {
    module.exports = exports = factory(
        require('./gnode-store')
    );
}(function (gnodeStore) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var planStore = new gnodeStore.GnodeStore('Plan');

    // Export instance
    return planStore;
}));
