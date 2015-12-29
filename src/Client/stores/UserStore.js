(function (factory) {
    module.exports = exports = factory(
        require('jquery'),
        require('rx'),
        require('hl-common-js/src/io'),
        require('components/MessageBox')
    );
}(function ($, Rx, hlio, MessageBox) {

    var UserStore = function () {

        /**
         * RxJS Event Publisher
         */
        var updates = new Rx.BehaviorSubject([]);
        this.updates = updates;

        /**
         * REST API
         */
        var _api = {
            getPreferences: function () {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/settings',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            putPreference: function (model) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/settings',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(model)
                });
            }
        };

        /**
         * Store Methods
         */
        this.updateProfileUriFromSignalR = function (uri) {
            var val =  updates.value;
            Object.assign(val, { profileUri: uri });
            updates.onNext(val);
        };

        this.updatePrefs = function (prefs) {

            var updated = prefs,
                original = Object.assign({}, updates.value),
                val = updates.value;

            /**
             * Optimistic Concurrency
             * and Notify subscribers
             */
            Object.assign(val, updated);
            updates.onNext(val);

            _api.putPreference(val)
            .done(function (result) {
                /**
                 * :D
                 * Sync server result with our optimistic model
                 * of what we thought the server would return
                 * and Notify subscribers
                 */
                if (typeof result !== 'undefined' && result != null) {
                    Object.assign(val, result);
                    updates.onNext(val);
                }

                /**
                 * Save to local storage
                 */
                hlio.saveLocal('hl.' + user + '.prefs', val, secret);

                /**
                 * Notify user of successful update
                 */
                MessageBox.notify('Updated preferences', 'success');
            })
            .fail(function (err) {
                /**
                 * :(
                 * Sync back to the original model
                 * and Notify subscribers
                 */
                Object.assign(val, original);
                updates.onNext(updates.value);

                /**
                 * Notify user of failed attempt to update
                 */
                MessageBox.notify(err.responseText, 'error');
            });
        };

        var user = 'my';
        var secret = 'hash';
        var baseUrl = null;
        
        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';
            
            /**
             * Get preferences from the server
             */
            _api.getPreferences().done(function (result) {
                hlio.saveLocal('hl.' + user + '.prefs', result, secret);
                updates.onNext(result);
            });

            /**
             * Use local storage to give user something to look at
             * until the server gets back the latest data
             */
            var prefs = hlio.loadLocal('hl.' + user + '.prefs', secret);
            if (prefs) {
                updates.onNext(prefs);
            }
        };
    };

    return new UserStore();

}));
