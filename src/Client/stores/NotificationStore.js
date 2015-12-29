(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/store'),
        require('jquery'),
        require('components/MessageBox')
    );
}(function (hlstore, $, MessageBox) {

    var NotificationStore = function () {
        hlstore.Store.call(this);
        this.updates.value = [];
        var me = this;
        var baseUrl = window.location.href.split('/').slice(0,3).join('/') + '/doozy';
        
        this.addNotificationFromSignalR = function (notification) {
            var notifications = me.updates.value;

            // change strings to dates
            notification.occurredAt = new Date(notification.occurredAt);
            if (notification.readAt !== null) {
                notification.readAt = new Date(notification.readAt);
            }

            // add to notifications and set state
            notifications.push(notification);
            me.notify();

            // if it hasn't been read, then give an extra visible indicator
            if (notification.readAt === null) {
                MessageBox.notify('You\'ve got a new notification!', 'success');
            }
        };

        this.removeNotification = function (userName, kind) {
            var notifications = me.updates.value;
            var index = -1;
            for (var i = 0; i < notifications.length; i++) {
                if (notifications[i].userName === userName && notifications[i].kind === kind) {
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                notifications.splice(index, 1);
                me.notify();
            }
        };

        this.acknowledgeNotification = function (notification) {
            $.ajax({
                context: me,
                url: baseUrl + '/api/acknowledgenotification/' + notification.id,
                dataType: 'json',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ userName: 'dummy' }),
                // headers: {
                //     'Authorization': 'Bearer ' + clientApp.getAccessToken()
                // },
                success: function(result) {
                    // find notification
                    var notifications = me.updates.value;
                    var index = -1;
                    for (var i = 0; i < notifications.length; i++) {
                        if (notifications[i].id === result.id) {
                            notifications[i].readAt = result.readAt;
                            me.notify();
                            break;
                        }
                    }
                },
                error: function(xhr, status, err) {
                    console.error('acknowledgeNotification', status, err.toString());
                }
            });
        };
    };
    NotificationStore.prototype = Object.create(hlstore.Store.prototype);
    NotificationStore.prototype.constructor = NotificationStore;

    return new NotificationStore();
}));
