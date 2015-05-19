/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react'
        ], factory);
	}
	else {
		// Global (browser)
		root.NotificationListItem = factory(
            root.React
        );
	}
}(this, function (React, actionStore, TimerBar, WeatherIcon, FocusActions, ManageFocus, AddEditAction, LogAction, Conversation) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var item = this.props.data;
    
            /**
             * Define Inline Styles
             */
            var notificationStyle = {
              fontSize: '100%',
              fontWeight: 'bold'
            };

            var notificationSpanStyle = Object.assign({}, notificationStyle);
            
            if (item.readAt !== null) {
                Object.assign(notificationSpanStyle, {
                    fontStyle: 'italic',
                    fontWeight: 'normal'
                });
            }
            
            var notificationLinkStyle = {
                display: 'block',
                padding: '3px 20px',
                clear: 'both',
                fontWeight: 'normal',
                lineHeight: '1.42857143',
                color: '#333',
                whiteSpace: 'normal',
                fontSize: '16px',
                borderBottom: '1px solid #e0e0e0'
            }
            
            /**
             * Render notification
             */
            var notification = null;
            if (item.kind === 'Connection Request') {
                notification = (
                    <a style={notificationLinkStyle} onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span style={notificationSpanStyle}>{item.subject} requested to connect with you</span>
                        <button type="button" className="btn btn-success pull-right" onClick={this.props.handleNotificationClicked.bind(null, item, 'Accept Connection')}><i className="fa fa-check-square-o"></i></button>
                        <button type="button" className="btn btn-danger pull-right" onClick={this.props.handleNotificationClicked.bind(null, item, 'Reject Connection')}><i className="fa fa-trash"></i></button>
                    </a>  
                );
            } else if (item.kind === 'Connection Accepted') {
                notification = (
                    <a style={notificationLinkStyle} onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span style={notificationSpanStyle}>{item.subject} accepted your connection request</span>
                    </a>  
                );
            } else if (item.kind === 'New Message') {
                notification = (
                    <a style={notificationLinkStyle} onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span style={notificationSpanStyle}>{item.subject} sent you a message</span>
                    </a>  
                );
            } else {
                // general notifications
                notification = (
                    <a style={notificationLinkStyle} onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span style={notificationSpanStyle}>{item.subject}</span>
                    </a>
                );
            }

            /**
             * HTML
             */
            return (
                <li style={notificationStyle} key={'notify' + item.occurredAt.getTime()}>
                    {notification}
                </li>
            );
        }
    });
}));