(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox')
    );
}(function ($, Rx, hlio, MessageBox) {

    var ActionStore = function () {
        /**
         * REST API
         */
        var _api = {
            getActions: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/actions',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            getAction: function (actionId) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/actions/' + encodeURIComponent(actionId),
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            postAction: function (action) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/actions',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(action)
                });
            },
            putAction: function (action) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/actions',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(action)
                });
            },
            deleteAction: function (action) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/actions/' + encodeURIComponent(action.id),
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'DELETE',
                    contentType: 'application/json'
                });
            }
        };

        /**
         * RxJS Event Publisher
         */
        var updates = new Rx.BehaviorSubject([]);
        this.updates = updates;

        /**
         * Store Methods
         */
        this.create = function (newAction, done, fail) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(newAction));

            _api.postAction(newAction)
            .done(function (result) {
                Object.assign(newAction, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
                MessageBox.notify('Added action ' + newAction.name, 'success');
                if (typeof done !== 'undefined' && done !== null) {
                    done(newAction);
                }
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newAction; });
                updates.onNext(filtered);
                MessageBox.notify(err.responseText, 'error');
                if (typeof fail !== 'undefined' && fail !== null) {
                    fail(err);
                }
            });
        };

        this.destroy = function (action) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item.id !== action.id; });
            updates.onNext(filtered);

            // ui.queueRequest('Action', action.id, 'Deleted action ' + action.name, function () {
            _api.deleteAction(action)
            .done( function () {
                hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(action));
                MessageBox.notify(err.responseText, 'error');
            });
            // }, function () {
            //     updates.onNext(updates.value.concat(action));
            // });
        };

        this.refreshActions = function (actionIds) {
            if (!actionIds || actionIds.length === 0) {
                return;
            }
            actionIds.forEach(function (actionId) {
                _api.getAction(actionId)
                .done( function (action) {
                    if (action) {
                        var actionToUpdate = _.find(updates.value, function(item) {
                            return item.id === action.id;
                        });
                        if (actionToUpdate) {
                            actionToUpdate = Object.assign(actionToUpdate, action);
                            updates.onNext(updates.value);
                        }
                    }
                });
            });

        };

        this.update = function (action) {

            // get object reference to action in store
            var actionToSave = _.find(updates.value, function(item) {
                return item.id === action.id;
            });

            // keep copy of original for undo
            var original = Object.assign({}, actionToSave);

            // optimistic concurrency
            Object.assign(actionToSave, action);
            updates.onNext(updates.value);

            // ui.queueRequest('Action', action.id, 'Updated action ' + actionToSave.name, function () {
            _api.putAction(actionToSave)
            .done(function (result) {
                Object.assign(actionToSave, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            })
            .fail(function  (err) {
                Object.assign(actionToSave, original);
                updates.onNext(updates.value);
                MessageBox.notify(err.responseText, 'error');
            });
            // }, function () {
            //     Object.assign(actionToSave, original);
            //     updates.onNext(updates.value);
            // });
        };

        this.getActionByName = function (name) {
            var existingAction = _.find(updates.value, function(item) {
                return cleanActionName(item.name) === cleanActionName(name.toLowerCase());
            });
            return existingAction;
        };

        this.getActionById = function (id) {
            var existingAction = _.find(updates.value, function(item) {
                return item.id.toLowerCase() === id.toLowerCase();
            });
            return existingAction;
        };

        var user = 'my';
        var secret = 'hash';
        var baseUrl = null;

        var cleanActionName = function (name) {
            return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
        };

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';

            // populate store - call to database
            _api.getActions()
            .done(function (result) {
                hlio.saveLocal('hl.' + user + '.actions', result, secret);
                updates.onNext(result);
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });

            var actions = hlio.loadLocal('hl.' + user + '.actions', secret);
            if (actions) {
                updates.onNext(actions);
            }
        };
    };

    return new ActionStore();
}));
