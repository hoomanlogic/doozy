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