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
        },
        deleteLog: function (logId) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/logentries/' + logId,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'DELETE',
                contentType: 'application/json'
            });
        },
        postLog: function (log) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/logentries',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(log)
            });
        },
        putLog: function (log) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/logentries',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(log)
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
    
    this.lognew = function (newAction, log) {
        
        // update now for optimistic concurrency
        updates.onNext(updates.value.concat(newAction));
        
        _api.postAction(newAction)
        .done(function (postActionResult) {
            Object.assign(newAction, postActionResult);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            
            var latestEntry = { date: log.performed, actionId: newAction.id, entry: 'performed', duration: log.duration, details: log.details };
            Object.assign(newAction, { latestEntry: latestEntry });
            updates.onNext(updates.value);
            
            _api.postLog(latestEntry)
            .done(function (postLogResult) {
                Object.assign(newAction, postLogResult);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
                toastr.success('Logged new action ' + newAction.name);
            })
            .fail(function (err) {
                Object.assign(newAction, postActionResult);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
            });
            
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== newAction; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
        });
        

    };
    
    this.destroy = function (action) {
        // optimistic concurrency
        var filtered = updates.value.filter( function (item) { return item.ref !== action.ref; });
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
    
    this.update = function (updateArgs) {
        
        var actionToSave = _.find(updates.value, function(item) { 
            return item.ref === updateArgs.actionRef; 
        });
        var state = updateArgs.state,
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
    
    this.updateLogEntry = function (log, updates) {
        
//        var actionToSave = _.find(updates.value, function(item) { 
//            return item.ref === updateArgs.actionRef; 
//        });
//        var state = updateArgs.state,
//            original = Object.assign({}, actionToSave);
//        
        var val = log,
            original = Object.assign({}, log);
        Object.assign(val, updates);
//        updates.onNext(updates.value);
        
        _api.putLog(val)
        .done(function (result) {
//            Object.assign(val, result);
//            updates.onNext(updates.value);
//            hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            toastr.success('Updated log entry');
        })
        .fail(function  (err) {
            Object.assign(val, original);
//            updates.onNext(updates.value);
            toastr.error(err.responseText);
        });
    };
        
    this.toggle = function (action) {
        
        var actionToSave = _.find(updates.value, function(item) { 
            return item.ref === action.ref; 
        });
        var original = Object.assign({}, actionToSave);
        
        var val = actionToSave;
        
        var isChecked = action.lastPerformed !== null;
        if (!isChecked) {
            var performed = prompt('When was this performed?', new Date());
            if (performed === null) {
                return;
            }
            performed = new Date(performed);
            var duration = prompt('How many minutes did it take?', action.duration);
            if (duration === null) {
                return;   
            }
            var latestEntry = { date: performed, actionId: action.id, entry: 'performed', duration: duration };
            Object.assign(val, { latestEntry: latestEntry });
            updates.onNext(updates.value);
            
            _api.postLog(latestEntry)
            .done(function (result) {
                Object.assign(val, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
                toastr.success('Logged action ' + action.name);
            })
            .fail(function (err) {
                Object.assign(val, original);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
            });
        } else {
            var logId = actionToSave.latestEntry.id;
            Object.assign(val, { latestEntry: null });
            updates.onNext(updates.value);
            
            _api.deleteLog(logId)
            .done(function (result) {
                Object.assign(val, result);
                updates.onNext(updates.value);
                hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
                toastr.success('Latest peformed log removed for action ' + action.name);
            })
            .fail(function () {
                Object.assign(val, original);
                updates.onNext(updates.value);
                toastr.error(err.responseText);
            });
        }
    };
    
    this.log = function (action, log) {
        
        var actionToSave = _.find(updates.value, function(item) { 
            return item.ref === action.ref; 
        });
        var original = Object.assign({}, actionToSave);
        
        var val = actionToSave;

        var latestEntry = { date: log.performed, actionId: action.id, entry: 'performed', duration: log.duration, details: log.details };
        Object.assign(val, { latestEntry: latestEntry });
        updates.onNext(updates.value);

        _api.postLog(latestEntry)
        .done(function (result) {
            Object.assign(val, result);
            updates.onNext(updates.value);
            hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            toastr.success('Logged action ' + action.name);
        })
        .fail(function (err) {
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
    
    this.getActionByRef = function (ref) {
        var existingAction = _.find(updates.value, function(item) { 
            return item.ref.toLowerCase() === ref.toLowerCase() || item.id === ref.toLowerCase(); 
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
        _api.getActions().done(function (result) {
            hlio.saveLocal('hl.' + user + '.actions', result, secret);
            updates.onNext(result);
        });

        var actions = hlio.loadLocal('hl.' + user + '.actions', secret);
        if (actions) {
            updates.onNext(actions);   
        }
    };
};

var actionStore = new ActionStore();