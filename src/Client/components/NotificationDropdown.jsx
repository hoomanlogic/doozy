(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('hl-common-js/src/those'),
        require('stores/NotificationStore')
    );
}(function (React, those, notificationStore) {

    var NotificationDropdown = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        propTypes: {
            isOpen: React.PropTypes.bool
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleToggleClick: function () {
            var isOpen = !this.props.isOpen;
            if (isOpen) {
                // ui.goTo('Notifications');
            }
            else {
                // ui.goTo('Do');
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var badge;
            var unreadCount = those(notificationStore.updates.value).where({readAt: null}).length;

            if (unreadCount > 0) {
                badge = (<span style={styles.badge}>{unreadCount}</span>);
            }

            /* eslint-disable no-script-url */
            return (
                <li ref="root" onClick={this.handleToggleClick}>
                    <a className={this.props.isOpen ? 'active' : ''} href="javascript:;" style={{padding: '5px'}}><span><i className="fa fa-2x fa-bell-o"></i>{badge}</span></a>
                </li>
            );
            /* eslint-enable no-script-url */
        }
    });

    var styles = {
        badge: {
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
        }
    };

    return NotificationDropdown;
}));
