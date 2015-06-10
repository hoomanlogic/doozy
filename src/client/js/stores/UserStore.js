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
                url: doozy.HOST_NAME + '/api/settings',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + doozy.getAccessToken()
                }
            });
        },
        putPreference: function (model) {
            return $.ajax({
                context: this,
                url: doozy.HOST_NAME + '/api/settings',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + doozy.getAccessToken()
                },
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
            toastr.success('Updated preferences');
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
            toastr.error(err.responseText);
        });
    };
    
    var user = 'my';
    var secret = 'hash';

    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
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

var userStore = new UserStore();