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

            var classNames = 'notification';
            if (item.readAt !== null) {
                classNames += ' read';   
            }
            var notification = null;
            if (item.kind === 'Connection Request') {
                notification = (
                    <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span className={classNames}>{item.subject} requested to connect with you</span>
                        <button type="button" className="btn btn-success pull-right" onClick={this.props.handleNotificationClicked.bind(null, item, 'Accept Connection')}><i className="fa fa-check-square-o"></i></button>
                        <button type="button" className="btn btn-danger pull-right" onClick={this.props.handleNotificationClicked.bind(null, item, 'Reject Connection')}><i className="fa fa-trash"></i></button>
                    </a>  
                );
            } else if (item.kind === 'Connection Accepted') {
                notification = (
                    <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span className={classNames}>{item.subject} accepted your connection request</span>
                    </a>  
                );
            } else if (item.kind === 'New Message') {
                notification = (
                    <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span className={classNames}>{item.subject} sent you a message</span>
                    </a>  
                );
            } else {
                // general notifications
                notification = (
                    <a onClick={this.props.handleNotificationClicked.bind(null, item)}>
                        <span className={classNames}>{item.subject}</span>
                    </a>
                );
            }

            return (
                <li className="notification" key={'notify' + item.occurredAt.getTime()}>
                    {notification}
                </li>
            );
        }
    });
}));