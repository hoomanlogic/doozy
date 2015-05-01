var TargetStore = function () {

    /**
     * REST API
     */
    var _api = {
        getTargets: function () {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/targets',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                }
            });
        },
        postTarget: function (target) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/targets',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(target)
            });
        },
        putTarget: function (target) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/targets',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(target)
            });
        },
        deleteTarget: function (target) {
            return $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/targets/' + encodeURIComponent(target.id),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'DELETE',
                contentType: 'application/json'
            });
        },
        deleteLog: function (target, logId) {
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
        postLog: function (target, log) {
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
    this.create = function (title) {
        
        var newTarget = new ToDo(title);
        
        // update now for optimistic concurrency
        updates.onNext(updates.value.concat(newTarget));
        
        _api.postTarget(newTarget)
        .done(function (result) {
            updates.value.forEach(function (item) { 
                if (item === newTarget) {
                    Object.assign(item, result);
                }
            });
            updates.onNext(updates.value);
            toastr.success('Added target ' + val.name);
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== newTarget; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
        });
    };

    this.add = function (target) {
        
        // optimistic concurrency
        updates.onNext(updates.value.concat(target));
        
        _api.postTarget(target)
        .done(function (result) {
            updates.value.forEach(function (item) { 
                if (item === target) {
                    Object.assign(item, result);
                }
            });
            updates.onNext(updates.value);
            toastr.success('Added target ' + val.name);
        })
        .fail( function (err) {
            var filtered = updates.value.filter( function (item) { return item !== target; });
            updates.onNext(filtered);
            toastr.error(err.responseText);
        });
    };
    
    this.destroy = function (target) {
        // optimistic concurrency
        var filtered = updates.value.filter( function (item) { return item !== target; });
        updates.onNext(filtered);
        
        _api.deleteTarget(target)
        .done( function () {
            toastr.success('Deleted target ' + val.name);
        })
        .fail( function (err) {
            updates.onNext(updates.value.concat(target));
            toastr.error(err.responseText);
        });
    };
    
    this.update = function (updateArgs) {
        
        var targetToSave = _.find(updates.value, function(item) { 
            return item.ref === updateArgs.targetRef; 
        });
        var state = updateArgs.state,
            original = Object.assign({}, targetToSave);
        
        var val = targetToSave;
        Object.assign(val, state);
        updates.onNext(updates.value);
        
        _api.putTarget(val)
        .done(function () {
            toastr.success('Updated target ' + val.name);
        })
        .fail(function  (err) {
            Object.assign(val, original);
            updates.onNext(updates.value);
            toastr.error(err.responseText);
        });
    };
        
    this.toggle = function (targetToToggle) {
        return targets.map(function (target) {
            var val = target;
            var performed = new Date();
            if (target === targetToToggle) {
                if (target.retire === null) {
                    _api.postLog(target, {
                        date: performed,
                        targetId: target.id, 
                        entry: 'performed',
                        duration: (prompt('How many minutes did it take?', target.duration) || this.props.target.duration)
                    });
                    val = Object.assign({}, target, { retire: performed })
                } else {
                    _api.deleteLog(target, target.latestEntry.id);
                    val = Object.assign({}, target, { retire: null, latestEntry: null })
                }
            }
            return val;
        });
    };

    var user = 'my';
    var secret = 'hash';
    
    this.init = function (userName, userId) {
        
        user = userName;
        secret = userId;
        
        // populate store - call to database
        _api.getTargets().done(function (result) {
            updates.onNext(result);
        });
    };

};

var targetStore = new TargetStore();