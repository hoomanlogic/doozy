(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('../../js/stores/NotificationStore')
    );
}(function (React, notificationStore) {

    var NotificationDropdown = React.createClass({
        propTypes: {
            isOpen: React.PropTypes.bool
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleToggleClick: function () {
            var isOpen = !this.props.isOpen;
            if (isOpen) {
                ui.goTo('Notifications');
            } else {
                ui.goTo('Do');
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var badge,
                unreadCount = _.where(notificationStore.updates.value, {readAt: null}).length;

            var badgeStyle = {
                display: 'inline',
                position: 'relative',
                top: '-10px',
                left: '-25px',
                fontSize: '75%',
                fontWeight: '700',
                lineHeight: '1',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                verticalAlign: 'baseline',
                marginRight: '-10px'
            };

            if (unreadCount > 0) {
                badge = (<span style={badgeStyle}>{unreadCount}</span>);
            }

            return (
                <li ref="root" onClick={this.handleToggleClick}>
                    <a className={this.props.isOpen ? 'active' : ''} href="javascript:;" style={{padding: '5px'}}><span><i className="fa fa-2x fa-bell-o"></i>{badge}</span></a>
                </li>
            );
        }
    });
    return NotificationDropdown;
}));
