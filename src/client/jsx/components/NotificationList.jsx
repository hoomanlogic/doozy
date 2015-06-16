// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('../../js/stores/NotificationStore'),
            require('../../../../../react_components/src/DropDownMenu'),
            require('./NotificationListItem')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            '../../js/stores/NotificationStore',
            '../../../../../react_components/src/DropDownMenu',
            './NotificationListItem'
        ], factory);
	}
	else {
		// Global (browser)
		window.NotificationList = factory(
            window.React,
            window.notificationStore,
            window.NotificationListItem
        );
	}
}(function (React, notificationStore, NotificationListItem) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleNotificationClicked: function (notification, verb) {
            if (!_.isUndefined(verb) && verb === 'Accept Connection') {
                connectionStore.acceptConnection(notification.subject);
            } else if (!_.isUndefined(verb) && verb === 'Reject Connection') {
                connectionStore.rejectConnection(notification.subject);
            } else {
                if (notification.kind === 'New Message') {
                    ui.openConversation(notification.subject);
                } else if (notification.kind === 'Connection Accepted') {
                    ui.goTo('Connect');
                }
                notificationStore.acknowledgeNotification(notification);
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var domUnread,
                domRead;
            
            var notifications = _.sortBy(notificationStore.updates.value, 'occurredAt').reverse();
            
            var unreadNotifications = _.where(notifications, {readAt: null});
            
            var readNotifications = _.filter(notifications, function (item) { 
                return typeof item.readAt !== 'undefined' && item.readAt !== null;
            });
            
            if (unreadNotifications.length > 0) {
                domUnread = (
                    <div>
                        <ul className="notifications">
                            {unreadNotifications.map( 
                                function(item) {
                                    return (<NotificationListItem key={item.id} data={item} handleNotificationClicked={this.handleNotificationClicked} />);
                                }.bind(this)
                            )}
                        </ul>
                    </div>
                );
            } else {
                domUnread = (
                    <div>
                        <h2 style={{margin: '0.2rem'}}>No new notifications. You're all caught up!</h2>
                    </div>
                );
            }
            
            var notificationsStyle = {
                listStyle: 'none',
                padding: '0'
            };


            if (readNotifications.length > 0) {
                domRead = (
                    <div>
                        <h2 style={{margin: '0.2rem'}}>Recent Notifications</h2>
                        <ul style={notificationsStyle}>
                            {readNotifications.map( 
                                function(item) {
                                    return (<NotificationListItem key={item.id} data={item} handleNotificationClicked={this.handleNotificationClicked} />);
                                }.bind(this)
                            )}
                        </ul>
                    </div>
                );
            }
            
            return (
                <div style={{padding: '5px'}}>
                    {domUnread}
                    {domRead}
                </div>
            );
        }
    });
}));