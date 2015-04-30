/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
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
		root.NotificationDropdown = factory(
            root.React,
            root.notificationStore,
            root.DropDownMenu,
            root.NotificationListItem
        );
	}
}(this, function (React, notificationStore, DropDownMenu, NotificationListItem) {
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
            var notifications = _.sortBy(notificationStore.updates.value, 'occurredAt').reverse();
            var unreadCount = _.where(this.props.notifications, {readAt: null}).length;
            var badge = null;
            if (unreadCount > 0) {
                badge = (<span className="notify-badge">{unreadCount}</span>);
            }

            var menuItems = notifications.map( 
                function(item) {
                    return (<NotificationListItem key={item.id} data={item} handleNotificationClicked={this.handleNotificationClicked} />);
                }.bind(this)
            );

            return (
                <DropdownMenu style={{padding: '5px'}} buttonContent={<span><i className="fa fa-2x fa-bell-o"></i>{badge}</span>} menuItems={menuItems} dropDownMenuStyle={this.props.dropDownMenuStyle} />
            );
        }
    });
}));