(function (factory) {
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('jquery'),
            require('rx'),
            require('toastr'),
            require('hl-common-js/src/io')
        );
    }
    else {
        // Global (browser)
        window.focusStore = factory(window.$, window.Rx, window.toastr, window.hlio);
    }
}(function ($, Rx, toastr, hlio) {
    var FocusStore = function () {

        /**
         * REST API
         */
        var _api = {
            getFocuses: function () {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/focuses',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    }
                });
            },
            postFocus: function (focus) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/focuses',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(focus)
                });
            },
            putFocus: function (focus) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/focuses',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(focus)
                });
            },
            deleteFocus: function (focus) {
                return $.ajax({
                    context: this,
                    url: clientApp.HOST_NAME + '/api/focuses/' + encodeURIComponent(focus.id),
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    },
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
        this.create = function (newFocus) {

            // update now for optimistic concurrency
            updates.onNext(updates.value.concat(newFocus));

            _api.postFocus(newFocus)
            .done(function (result) {
                updates.value.forEach(function (item) {
                    if (item === newFocus) {
                        Object.assign(item, result);
                        newFocus = item;
                    }
                });
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.focuses', updates.value, secret);
                toastr.success('Added focus ' + newFocus.name);
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newFocus; });
                updates.onNext(filtered);
                toastr.error(err.responseText);
            });
        };

        this.destroy = function (focus) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item !== focus; });
            updates.onNext(filtered);

            _api.deleteFocus(focus)
            .done( function () {
                toastr.success('Deleted focus ' + focus.name);
                hlio.saveLocal('hl.' + user + '.focuses', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(focus));
                toastr.error(err.responseText);
            });
        };

        this.update = function (focus) {

            var focusToSave = _.find(updates.value, function(item) {
                return item.id === focus.id;
            });
            var state = focus,
                original = Object.assign({}, focusToSave);

            var val = focusToSave;
            Object.assign(val, state);
            updates.onNext(updates.value);

            _api.putFocus(val)
            .done(function (result) {
                Object.assign(val, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.focuses', updates.value, secret);
                toastr.success('Updated focus ' + val.name);
            })
            .fail(function  (err) {
                Object.assign(val, original);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
            });
        };

        this.updateFromServer = function (focusId, newState) {
            var focusToUpdate = _.find(updates.value, function(item) {
                return item.id === focusId;
            });
            Object.assign(focusToUpdate, newState);
            updates.onNext(updates.value);
        };

        var user = 'my';
        var secret = 'hash';

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;

            // populate store - call to database
            _api.getFocuses()
            .done(function (result) {
                updates.onNext(result);
                hlio.saveLocal('hl.' + user + '.focuses', updates.value, secret);
            })
            .fail(function (err) {
                toastr.error(err.responseText);
            });

            var focuses = hlio.loadLocal('hl.' + user + '.focuses', secret);
            if (focuses) {
                updates.onNext(focuses);
            }
        }

    };

    return new FocusStore();
}));
