var NotificationDropdown = React.createClass({
    render: function () {
        var notifications = _.sortBy(notificationStore.updates.value, 'occurredAt').reverse();
        var unreadCount = _.where(this.props.notifications, {readAt: null}).length;
        var badge = null;
        if (unreadCount > 0) {
            badge = (<span className="notify-badge">{unreadCount}</span>);
        }

        var menuItems = notifications.map( 
            function(item) {
                return (<Notification key={item.id} data={item} handleNotificationClicked={this.handleNotificationClicked} />);
            }.bind(this)
        );
              
        return (
            <DropdownMenu className='pull-right' style={{padding: '5px'}} buttonContent={<span><i className="fa fa-2x fa-bell-o"></i>{badge}</span>} menuItems={menuItems} />
        );
    },
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
    }
});