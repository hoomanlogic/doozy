(function (factory) {
    module.exports = exports = factory(
        require('./gnode-store'),
        require('./action-store'),
        require('app/doozy')
    );
}(function (gnodeStore, actionStore, doozy) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var logEntryStore = new gnodeStore.GnodeStore('LogEntry');

    logEntryStore.save = function (logEntry, done, fail) {
        var existingAction, newAction;
        if (logEntry.actionName && logEntry.actionName.length) {
            existingAction = actionStore.get(logEntry.actionName);
            if (existingAction) {
                logEntry.actionId = existingAction.id;
            }
            else {
                newAction = doozy.action(logEntry.actionName);
                newAction.created = this.state.date;
            }
        }

        // update log entry
        if (!newAction) {
            if (logEntry.isNew) {
                logEntryStore.create(logEntry, done, fail);
            }
            else {
                logEntryStore.update(logEntry, done, fail);
            }
        }
        else {
            // Create action first
            actionStore.create(newAction, function (serverAction) {
                logEntry.actionId = serverAction.id;
                // Then Create logentry that references action
                if (logEntry.isNew) {
                    logEntryStore.create(logEntry, done, fail);
                }
                else {
                    logEntryStore.update(logEntry, done, fail);
                }
            });
        }
    };

    // Export instance
    return logEntryStore;
}));
