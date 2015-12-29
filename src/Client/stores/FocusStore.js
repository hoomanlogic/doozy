(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox')
    );
}(function ($, Rx, hlio, MessageBox) {

    var FocusStore = function () {

        /**
         * REST API
         */
        var _api = {
            getFocuses: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/focuses',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            postFocus: function (focus) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/focuses',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(focus)
                });
            },
            putFocus: function (focus) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/focuses',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(focus)
                });
            },
            deleteFocus: function (focus) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/focuses/' + encodeURIComponent(focus.id),
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
                MessageBox.notify('Added focus ' + newFocus.name, 'success');
            })
            .fail( function (err) {
                var filtered = updates.value.filter( function (item) { return item !== newFocus; });
                updates.onNext(filtered);
                MessageBox.notify(err.responseText, 'error');
            });
        };

        this.destroy = function (focus) {
            // optimistic concurrency
            var filtered = updates.value.filter( function (item) { return item !== focus; });
            updates.onNext(filtered);

            _api.deleteFocus(focus)
            .done( function () {
                MessageBox.notify('Deleted focus ' + focus.name, 'success');
                hlio.saveLocal('hl.' + user + '.focuses', updates.value, secret);
            })
            .fail( function (err) {
                updates.onNext(updates.value.concat(focus));
                MessageBox.notify(err.responseText, 'error');
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
                MessageBox.notify('Updated focus ' + val.name, 'success');
            })
            .fail(function  (err) {
                Object.assign(val, original);
                updates.onNext(updates.value);
                MessageBox.notify(err.responseText, 'error');
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
        var baseUrl = null;
        
        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';
            
            // populate store - call to database
            _api.getFocuses()
            .done(function (result) {
                updates.onNext(result);
                hlio.saveLocal('hl.' + user + '.focuses', updates.value, secret);
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });

            var focuses = hlio.loadLocal('hl.' + user + '.focuses', secret);
            if (focuses) {
                updates.onNext(focuses);
            }
        };

    };

    return new FocusStore();
}));
