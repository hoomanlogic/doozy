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
		root.connectionStore = factory(root.hlstore, root.hlapp, root.$);
	}
}(this, function (hlstore, hlapp, $) {
    'use strict';
    
    var ConnectionStore = function () {
        hlstore.Store.call(this);
        this.updates.value = [];
        var me = this;

        this.getConnections = function () {
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/connections',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
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
                url: hlapp.HOST_NAME + '/api/requestconnection',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ userName: userName }),
                success: function() {
                    toastr.success('Connection requested!');
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem requesting this connection' + status + err);
                }
            });
        };

        this.acceptConnection = function (userName) {
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/acceptconnection',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username: userName }),
                success: function(result) {
                    // add to connections
                    me.updates.value.push(result);
                    me.notify();

                    toastr.success('Connection accepted!');

                    notificationStore.removeNotification(userName, 'Connection Request');
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem accepting this connection' + status + err);
                }
            });
        };

        this.rejectConnection = function (userName) {
            $.ajax({
                context: me,
                url: hlapp.HOST_NAME + '/api/rejectconnection',
                dataType: 'json',
                headers: {
                    'Authorization': 'Bearer ' + hlapp.getAccessToken()
                },
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

                    toastr.success('Connection rejected!');

                    notificationStore.removeNotification(userName, 'Connection Request');
                },
                error: function(xhr, status, err) {
                    toastr.error('Oh no! There was a problem rejecting this connection' + status + err);
                }
            });
        };
        
    };
    ConnectionStore.prototype = Object.create(hlstore.Store.prototype);
    ConnectionStore.prototype.constructor = ConnectionStore;

    return new ConnectionStore();
}));