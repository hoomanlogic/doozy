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
            }
            
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
}));