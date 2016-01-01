(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/store'),
        require('jquery'),
        require('NotificationStore'),
        require('components/MessageBox'),
        require('lodash')
    );
}(function (hlstore, $, notificationStore, MessageBox, _) {

    var ConnectionStore = function () {
        hlstore.Store.call(this);
        this.updates.value = [];
        var me = this;
        var baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';
        
        this.getConnections = function () {
            $.ajax({
                context: me,
                url: baseUrl + '/api/connections',
                dataType: 'json',
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                success: function(result) {
                    me.updates.value = result;
                    me.notify();
                },
                error: function(xhr, status, err) {
                    console.error('connections', status, err.toString());
                }
            });
        };

        this.requestConnection = function (userName) {
            $.ajax({
                context: me,
                url: baseUrl + '/api/requestconnection',
                dataType: 'json',
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ userName: userName }),
                success: function() {
                    MessageBox.notify('Connection requested!', 'success');
                },
                error: function(xhr, status, err) {
                    MessageBox.notify('Oh no! There was a problem requesting this connection' + status + err, 'error');
                }
            });
        };

        this.acceptConnection = function (userName) {
            $.ajax({
                context: me,
                url: baseUrl + '/api/acceptconnection',
                dataType: 'json',
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username: userName }),
                success: function(result) {
                    // add to connections
                    me.updates.value.push(result);
                    me.notify();

                    MessageBox.notify('Connection accepted!', 'success');

                    notificationStore.removeNotification(userName, 'Connection Request');
                },
                error: function(xhr, status, err) {
                    MessageBox.notify('Oh no! There was a problem accepting this connection' + status + err, 'error');
                }
            });
        };

        this.rejectConnection = function (userName) {
            $.ajax({
                context: me,
                url: baseUrl + '/api/rejectconnection',
                dataType: 'json',
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ userName: userName }),
                success: function() {

                    // find existing connection
                    var connections = me.updates.value;
                    var index = -1;
                    for (var i = 0; i < connections.length; i++) {
                        if (connections[i].userName === userName) {
                            index = i;
                            break;
                        }
                    }

                    // if found, remove it
                    if (index > -1) {
                        connections.splice(index, 1);
                        me.notify();
                    }

                    MessageBox.notify('Connection rejected!', 'success');

                    notificationStore.removeNotification(userName, 'Connection Request');
                },
                error: function(xhr, status, err) {
                    MessageBox.notify('Oh no! There was a problem rejecting this connection' + status + err, 'error');
                }
            });
        };

    };
    ConnectionStore.prototype = Object.create(hlstore.Store.prototype);
    ConnectionStore.prototype.constructor = ConnectionStore;

    return new ConnectionStore();
}));
