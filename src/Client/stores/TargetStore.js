(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox'),
        require('lodash')
    );
}(function ($, Rx, hlio, MessageBox, _) {

    var TargetStore = function () {

        /**
         * REST API
         */
        var _api = {
            getTargets: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/targets',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            postTarget: function (target) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/targets',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(target)
                });
            },
            putTarget: function (target) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/targets',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(target)
                });
            },
            deleteTarget: function (target) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/targets/' + encodeURIComponent(target.id),
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
        this.create = function (newTarget, done, fail) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(newTarget));

            _api.postTarget(newTarget)
            .done(function (result) {
                Object.assign(newTarget, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.targets', updates.value, secret);
                MessageBox.notify('Added target ' + newTarget.name, 'success');
                if (typeof done !== 'undefined' && done !== null) {
                    done(newTarget);
                }
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newTarget; });
                updates.onNext(filtered);
                MessageBox.notify(err.responseText, 'error');
                if (typeof fail !== 'undefined' && fail !== null) {
                    fail(err);
                }
            });
        };

        this.destroy = function (target) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item.id !== target.id; });
            updates.onNext(filtered);

            ui.queueRequest('Target', target.id, 'Deleted target ' + target.name, function () {
                _api.deleteTarget(target)
                .done( function () {
                    hlio.saveLocal('hl.' + user + '.targets', updates.value, secret);
                })
                .fail( function (err) {
                    updates.onNext(updates.value.concat(target));
                    MessageBox.notify(err.responseText, 'error');
                });
            }, function () {
                updates.onNext(updates.value.concat(target));
            });
        };

        this.update = function (target) {

            // get object reference to target in store
            var targetToSave = _.find(updates.value, function (item) {
                return item.id === target.id;
            });

            // keep copy of original for undo
            var original = Object.assign({}, targetToSave);

            // optimistic concurrency
            Object.assign(targetToSave, target);
            updates.onNext(updates.value);

            ui.queueRequest('Target', target.id, 'Updated target ' + targetToSave.name, function () {
                _api.putTarget(targetToSave)
                .done(function (result) {
                    Object.assign(targetToSave, result);
                    updates.onNext(updates.value);
                    hlio.saveLocal('hl.' + user + '.targets', updates.value, secret);
                })
                .fail(function (err) {
                    Object.assign(targetToSave, original);
                    updates.onNext(updates.value);
                    MessageBox.notify(err.responseText, 'error');
                });
            }, function () {
                Object.assign(targetToSave, original);
                updates.onNext(updates.value);
            });
        };

        this.getTargetByName = function (name) {
            var existingTarget = _.find(updates.value, function (item) {
                return cleanTargetName(item.name) === cleanTargetName(name.toLowerCase());
            });
            return existingTarget;
        };

        this.getTargetById = function (id) {
            var existingTarget = _.find(updates.value, function (item) {
                return item.id.toLowerCase() === id.toLowerCase();
            });
            return existingTarget;
        };

        var user = 'my';
        var secret = 'hash';
        var baseUrl = null;

        var cleanTargetName = function (name) {
            return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
        };

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';

            // populate store - call to database
            _api.getTargets()
            .done(function (result) {
                hlio.saveLocal('hl.' + user + '.targets', result, secret);
                updates.onNext(result);
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });

            var targets = hlio.loadLocal('hl.' + user + '.targets', secret);
            if (targets) {
                updates.onNext(targets);
            }
        };
    };

    return new TargetStore();
}));
