(function (factory) {
    module.exports = exports = factory(
        require('./gnode-store')
    );
}(function (gnodeStore) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var logEntryStore = new gnodeStore.GnodeStore('LogEntry');

    // Export instance
    return logEntryStore;
}));
