var ActionStore = function () {

    /**
     * REST API
     */
    var _api = {
        getActions: function () {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/actions',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                }
            });
        },
        postAction: function (action) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/actions',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(action)
            });
        },
        putAction: function (action) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/actions',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(action)
            });
        },
        deleteAction: function (action) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/actions/' + encodeURIComponent(action.id),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
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
    this.create = function (newAction) {
        
        // update now for optimistic concurrency
        updates.onNext(updates.value.concat(newAction));
        
        _api.postAction(newAction)
        .done(function (result) {
            Object.assign(newAction, result);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            toastr.success('Added action ' + newAction.name);
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== newAction; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
        });
    };
    
    this.destroy = function (action) {
        // optimistic concurrency
        var filtered = updates.value.filter( function (item) { return item.id !== action.id; });
        updates.onNext(filtered);
        
        _api.deleteAction(action)
        .done( function () {
            toastr.success('Deleted action ' + action.name);
            hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
        })
        .fail( function (err) {
            updates.onNext(updates.value.concat(action));
            toastr.error(err.responseText);
        });
    };
    
    this.update = function (action) {
        
        var actionToSave = _.find(updates.value, function(item) { 
            return item.id === action.id; 
        });
        var state = action,
            original = Object.assign({}, actionToSave);
        
        var val = actionToSave;
        Object.assign(val, state);
        updates.onNext(updates.value);
        
        _api.putAction(val)
        .done(function (result) {
            Object.assign(val, result);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            toastr.success('Updated action ' + val.name);
        })
        .fail(function  (err) {
            Object.assign(val, original);
            updates.onNext(updates.value);
            toastr.error(err.responseText);
        });
    };
    
    this.getExistingAction = function (name) {
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
    
    var cleanActionName = function (name) {
        return name.replace(/:/g, '').replace(/  /g, ' ').trim().toLowerCase();
    };
    
    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
        // populate store - call to database
        _api.getActions()
        .done(function (result) {
            hlio.saveLocal('hl.' + user + '.actions', result, secret);
            updates.onNext(result);
        })
        .fail(function (err) {
            toastr.error(err.responseText);
        });

        var actions = hlio.loadLocal('hl.' + user + '.actions', secret);
        if (actions) {
            updates.onNext(actions);   
        }
    };
};

var actionStore = new ActionStore();