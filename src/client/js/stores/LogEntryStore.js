// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('../../../../../common_js/src/store'),
            require('../app/app'),
            require('jquery')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            '../../../../../common_js/src/store',
            'jquery'
        ], factory);
	}
	else {
		// Global (browser)
		root.logEntryStore = factory(root.hlstore, root.hlapp, root.$);
	}
}(this, function (hlstore, hlapp, $) {
    'use strict';
    
    var LogEntryStore = function () {
        hlstore.Store.call(this);
        this.updates.value = [];
        var me = this;
        
        var _api = {
            postLogEntry: function (logEntry) {
                return $.ajax({
                    context: this,
                    url: hlapp.HOST_NAME + '/api/logentries',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + hlapp.getAccessToken()
                    },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(logEntry)
                });
            },
            putLogEntry: function (logEntry) {
                return $.ajax({
                    context: this,
                    url: hlapp.HOST_NAME + '/api/logentries',
                    dataType: 'json',
                    headers: {
                        'Authorization': 'Bearer ' + hlapp.getAccessToken()
                    },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(logEntry)
                });
            }
        };

        this.getLogEntries = function (userName) {
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/logentries?userName=' + encodeURIComponent(userName),
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                success: function(result) {
                    var logEntries = me.updates.value;
                    me.updates.value = logEntries.concat(result);
                    me.notify();
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem getting log entries.' + status + err);
                }
            });
        };
        
        this.getMyLogEntries = function () {
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/logentries',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                success: function(result) {
                    var logEntries = me.updates.value;
                    me.updates.value = logEntries.concat(result);
                    me.notify();
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem getting log entries.' + status + err);
                }
            });
        };
        
        this.log = function (logEntry) {

            var actionToUpdate = _.find(actionStore.updates.value, function(item) { 
                return logEntry.actionId === item.id; 
            });

            _api.postLogEntry(logEntry)
            .done(function (result) {
                // add log entry to collection
                me.updates.value = me.updates.value.concat(result);
                me.notify();
                
                // find last performed
                var lastPerformed = null;
                
                _.where(me.updates.value, {actionId: actionToUpdate.id, entry: "performed"}).map( function (item) {
                    if (lastPerformed === null || new Date(item.date) > new Date(lastPerformed)) {
                        lastPerformed = item.date;   
                    }
                });
                
                //me.updates.value.map(function (item) {
                //    if (item.actionId === actionToUpdate.id && item.entry === 'performed') {
                //        if (lastPerformed === null || new Date(item.date) > new Date(lastPerformed)) {
                //            lastPerformed = item.date;   
                //        }
                //    }
                //});
                
                // update action and notify
                if (actionToUpdate.lastPerformed !== lastPerformed) {
                    actionToUpdate.lastPerformed = lastPerformed;
                    if (result.nextDate === "0001-01-01T00:00:00") {
                        result.nextDate = null;   
                    }
                    if (actionToUpdate.nextDate !== result.nextDate) {
                        actionToUpdate.nextDate = result.nextDate;
                    }
                    actionStore.updates.onNext(actionStore.updates.value);
                }
                
                toastr.success('Logged action ' + result.actionName);
            })
            .fail(function (err) {
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
        
        this.update = function (logEntryToSave) {
            
            var logEntries = me.updates.value;
            var logEntry = _.find(logEntries, {id: logEntryToSave.id});
            var original = Object.assign({}, logEntry);

            Object.assign(logEntry, logEntryToSave);
            me.notify();
        
            _api.putLogEntry(logEntryToSave)
            .done(function (result) {
                Object.assign(logEntry, result);
                me.notify();
                //hlio.saveLocal('hl.' + user + '.logentries', updates.value, secret);
                toastr.success('Updated log entry for ' + logEntry.actionName);
            })
            .fail(function  (err) {
                Object.assign(logEntry, original);
                me.notify();
                toastr.error(err.responseText);
            });
        };
        
        this.destroy = function (logEntry) {
            
            var actionToUpdate = _.find(actionStore.updates.value, function(item) { 
                return logEntry.actionId === item.id; 
            });
            
            // optimistic concurrency
            var filtered = me.updates.value.filter( function (item) { return item.ref !== logEntry.ref; });
            me.updates.value = filtered;
            me.notify();
            
            $.ajax({
                context: this,
                url: hlapp.HOST_NAME + '/api/logentries/' + logEntry.id,
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'DELETE',
                contentType: 'application/json'
            })
            .done( function (result) {
                
                // find last performed
                var lastPerformed = null;
                
                _.where(me.updates.value, {actionId: actionToUpdate.id, entry: "performed"}).map( function (item) {
                    if (lastPerformed === null || new Date(item.date) > new Date(lastPerformed)) {
                        lastPerformed = item.date;   
                    }
                });
                
                //me.updates.value.map(function (item) {
                //    if (item.actionId === actionToUpdate.Id && item.entry === 'performed') {
                //        if (lastPerformed === null || new Date(item.date) > new Date(lastPerformed)) {
                //            lastPerformed = item.date;   
                //        }
                //    }
                //});
                
                // update action and notify
                if (actionToUpdate.lastPerformed !== lastPerformed) {
                    actionToUpdate.lastPerformed = lastPerformed;
                    if (result.nextDate === "0001-01-01T00:00:00") {
                        result.nextDate = null;   
                    }
                    if (actionToUpdate.nextDate !== result.nextDate) {
                        actionToUpdate.nextDate = result.nextDate;
                    }
                    actionStore.updates.onNext(actionStore.updates.value);
                }
                
                toastr.success('Deleted log entry for ' + logEntry.actionName);
                //hlio.saveLocal('hl.' + user + '.actions', updates.value, secret);
            })
            .fail( function (err) {
                me.updates.value = me.updates.value.concat(logEntry);
                me.notify();
                toastr.error(err.responseText);
            });
        };
        
        this.toggleUpvote = function (userName, id) {
            
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/toggleupvote',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ id: id }),
                success: function(result) {

                    // find existing logEntry
                    var logEntries = me.updates.value;
                    var logEntry = _.find(logEntries, {id: id});
                    if (result) {
                        logEntry.upvotes.push({
                            id: result.id,
                            date: result.date,
                            userId: result.userId,
                            comment: null,
                            attachmentUri: null
                        });
                    } else {
                        logEntry.upvotes = logEntry.upvotes.slice(1);
                    }
                    me.notify();
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem with the request!' + status + err);
                }
            });
        };
        
        this.addComment = function (userName, id, comment) {
            
            
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/comment',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ id: id, comment: comment }),
                success: function(result) {

                    // find existing logEntry
                    var logEntries = me.updates.value;
                    var logEntry = _.find(logEntries, {id: id});
                    logEntry.comments.push(result);
                    me.notify();
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem with the request!' + status + err);
                }
            });
        };
        
        this.deleteComment = function (userName, id) {
            
            
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/comment',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'DELETE',
                contentType: 'application/json',
                data: JSON.stringify({ id: id }),
                success: function(result) {

                    // find existing logEntry
//                    var logEntries = me.updates.value;
//                    var logEntry = _.find(logEntries, {id: id});
//                    me.notify();
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem with the request!' + status + err);
                }
            });
        };
    };
    LogEntryStore.prototype = Object.create(hlstore.Store.prototype);
    LogEntryStore.prototype.constructor = LogEntryStore;

    return new LogEntryStore();
}));