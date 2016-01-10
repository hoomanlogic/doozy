(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/store'),
        require('jquery'),
        require('hl-common-js/src/io'),
        require('./ActionStore'),
        require('components/MessageBox'),
        require('lodash')
    );
}(function (hlstore, $, hlio, actionStore, MessageBox, _) {

    var LogEntryStore = function () {
        hlstore.Store.call(this);
        this.updates.value = [];
        var me = this;

        var _api = {
            postAction: function (action) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/actions',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(action)
                });
            },
            getLogEntries: function () {
                return $.ajax({
                    context: me,
                    url: baseUrl + '/api/logentry',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // }
                });
            },
            postLogEntry: function (logEntry) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/logentry',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(logEntry)
                });
            },
            putLogEntry: function (logEntry) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/logentry',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(logEntry)
                });
            },
            deleteLogEntry: function (logEntry) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/logentry/' + logEntry.id,
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'DELETE',
                    contentType: 'application/json'
                });
            },
            postComment: function (logEntryId, comment) {
                return $.ajax({
                    context: me,
                    url: baseUrl + '/api/comment',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ id: logEntryId, comment: comment })
                });
            },
            putComment: function (logEntryPeanutId, comment) {
                return $.ajax({
                    context: this,
                    url: baseUrl + '/api/comment',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({ id: logEntryPeanutId, comment: comment })
                });
            },
            deleteComment: function (logEntryPeanutId) {
                return $.ajax({
                    context: me,
                    url: baseUrl + '/api/comment',
                    dataType: 'json',
                    // headers: {
                    //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                    // },
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify({ id: logEntryPeanutId })
                });
            }
        };

        this.getLogEntriesByUserName = function (userName) {
            $.ajax({
                context: me,
                url: baseUrl + '/api/logentry?userName=' + encodeURIComponent(userName),
                dataType: 'json',
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                success: function (result) {
                    var logEntries = me.updates.value;
                    me.updates.value = logEntries.concat(result);
                    me.notify();
                },
                error: function (xhr, status, err) {
                    MessageBox.notify('Oh no! There was a problem getting log entries.' + status + err, 'error');
                }
            });
        };

        this.getLogEntryById = function (id) {
            var existingLogEntry = _.find(this.updates.value, function (item) {
                return item.id.toLowerCase() === id.toLowerCase();
            });
            return existingLogEntry;
        };

        this.create = function (logEntry) {
            _api.postLogEntry(logEntry)
            .done(function (result) {
                // add log entry to collection
                me.updates.value = me.updates.value.concat(result);
                me.notify();

                actionStore.refreshActions([].concat(result.actionId));

                MessageBox.notify('Logged entry', 'success');
            })
            .fail(function (err) {
                MessageBox.notify(err.responseText, 'error');
            });
        };

        this.update = function (logEntry) {

            var logEntryToUpdate = _.find(me.updates.value, {id: logEntry.id});
            var original = Object.assign({}, logEntryToUpdate);
            var actionsToUpdate = [];

            if (logEntryToUpdate.actionId) {
                actionsToUpdate.push(logEntryToUpdate.actionId);
            }
            if (logEntry.actionId && logEntry.actionId !== logEntryToUpdate.actionId) {
                actionsToUpdate.push(logEntry.actionId);
            }

            // optimistic concurrency
            Object.assign(logEntryToUpdate, logEntry);
            me.notify();

            //ui.queueRequest('Log Entry', logEntry.id, 'Updated log entry', function () {
            _api.putLogEntry(logEntry)
            .done(function (result) {
                Object.assign(logEntryToUpdate, result);
                me.notify();
                hlio.saveLocal('hl.' + user + '.logentries', me.updates.value, secret);
                actionStore.refreshActions(actionsToUpdate);
            })
            .fail(function (err) {
                Object.assign(logEntryToUpdate, original);
                me.notify();
                MessageBox.notify(err.responseText, 'error');
            });
            //}, function () {
            //    Object.assign(logEntryToUpdate, original);
            //    me.notify();
            //});
        };

        this.createWithNewAction = function (newAction, logEntry) {

            actionStore.create(newAction, function (result) {
                logEntry.actionId = result.id;
                me.create(logEntry);
            });

        };

        this.updateWithNewAction = function (newAction, logEntry) {

            actionStore.create(newAction, function (result) {
                logEntry.actionId = result.id;
                me.update(logEntry);
            });

        };

        this.destroy = function (logEntry) {

            var actionIdToUpdate = logEntry.actionId;

            // optimistic concurrency
            var filtered = me.updates.value.filter( function (item) { return item.id !== logEntry.id; });
            me.updates.value = filtered;
            me.notify();

            //ui.queueRequest('Log Entry', logEntry.id, 'Deleted log entry', function () {
            _api.deleteLogEntry(logEntry)
            .done( function () {
                if (actionIdToUpdate) {
                    actionStore.refreshActions([actionIdToUpdate]);
                }
                hlio.saveLocal('hl.' + user + '.logentries', me.updates.value, secret);
            })
            .fail( function (err) {
                me.updates.value = me.updates.value.concat(logEntry);
                me.notify();
                MessageBox.notify(err.responseText, 'error');
            });
            //}, function () {
            //    me.updates.value = me.updates.value.concat(logEntry);
            //    me.notify();
            //});
        };

        this.toggleUpvote = function (userName, id) {

            $.ajax({
                context: me,
                url: baseUrl + '/api/toggleupvote',
                dataType: 'json',
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ id: id }),
                success: function (result) {

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
                    }
                    else {
                        logEntry.upvotes = logEntry.upvotes.slice(1);
                    }
                    me.notify();
                },
                error: function (xhr, status, err) {
                    MessageBox.notify('Oh no! There was a problem with the request!' + status + err, 'error');
                }
            });
        };

        this.addComment = function (userName, id, comment) {

            _api.postComment(id, comment)
            .done( function (result) {

                // find existing logEntry
                var logEntries = me.updates.value;
                var logEntry = _.find(logEntries, {id: id});
                logEntry.comments.push(result);
                me.notify();
            })
            .fail( function (xhr, status, err) {
                MessageBox.notify('Oh no! There was a problem with the request!' + status + err, 'error');
            });
        };

        this.updateComment = function (userName, logEntryId, id, comment) {

            _api.postComment(id, comment)
            .done( function () {

                // find existing logEntry
                var logEntries = me.updates.value;
                var logEntry = _.find(logEntries, {id: logEntryId});
                // find comment to update
                var findComment = _.find(logEntry.comments, {id: id});
                findComment.comment = comment;
                me.notify();
            })
            .fail( function (xhr, status, err) {
                MessageBox.notify('Oh no! There was a problem with the request!' + status + err, 'error');
            });
        };

        this.deleteComment = function (userName, logEntryId, id) {
            _api.deleteComment(id)
            .done( function () {

                var logEntries = me.updates.value;
                var logEntry = _.find(logEntries, {id: logEntryId});
                logEntry.comments = _.where(logEntry.comments, function (item) { return item.id !== id; });
                me.notify();

            })
            .fail( function (xhr, status, err) {
                MessageBox.notify('Oh no! There was a problem with the request!' + status + err, 'error');
            });
        };

        var user = 'my';
        var secret = 'hash';
        var baseUrl = null;

        this.init = function (userName, userId) {

            user = userName;
            secret = userId;
            baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';

            // populate store - call to database
            _api.getLogEntries()
            .done( function (result) {
                me.updates.value = result;
                hlio.saveLocal('hl.' + user + '.logentries', result, secret);
                me.notify();
            })
            .fail( function (xhr, status, err) {
                MessageBox.notify(err.responseText, 'error');
            });

            var logentries = hlio.loadLocal('hl.' + user + '.logentries', secret);
            if (logentries) {
                me.updates.value = logentries;
                me.notify();
            }
        };
    };
    LogEntryStore.prototype = Object.create(hlstore.Store.prototype);
    LogEntryStore.prototype.constructor = LogEntryStore;

    return new LogEntryStore();
}));
