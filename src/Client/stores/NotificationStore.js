(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/store'),
        require('jquery'),
        require('hl-common-js/src/those'),
        require('components/MessageBox')
    );
}(function (hlstore, $, those, MessageBox) {

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
            those(me.updates.value).flick({userName: userName, kind: kind}, function () {
                me.notify();
            });
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
                success: function (result) {
                    // update notification object
                    those(me.updates.value).forFirst({id: result.id}, function (item) {
                        item.readAt = result.readAt;
                        me.notify();
                    });
                },
                error: function (xhr, status, err) {
                    console.error('acknowledgeNotification', status, err.toString());
                }
            });
        };
    };

    NotificationStore.prototype = Object.create(hlstore.Store.prototype);
    NotificationStore.prototype.constructor = NotificationStore;

    return new NotificationStore();
}));
