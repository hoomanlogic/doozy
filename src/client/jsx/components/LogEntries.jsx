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
		root.LogEntries = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                connectionsLastUpdated: new Date().toISOString()
            };
        },

        componentWillMount: function () {
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
            this.handleLogEntryStoreUpdate(logEntryStore.updates.value);
        },
        componentWillUnmount: function () {
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleLogEntryStoreUpdate: function (connections) {
            this.setState({logEntriesLastUpdated: new Date().toISOString()});
        },
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var userName = this.props.userName;
            
            // find log entries for this user
            var logEntries = _.where(logEntryStore.updates.value, {userName: userName});
            logEntries = _.sortBy(logEntries, function (item) { return hlapp.getComparableLocalDateString(item.date) + '-' + (item.entry === 'performed' ? '1' : '0')});
            logEntries.reverse();
            
            return (
                <div className={'log-entries ' + (this.props.hidden ? 'hidden' : '')} style={{padding: '5px'}}>
                    {logEntries.map(
                        function(item) {
                            return (<LogEntryBox data={item} />);
                        }.bind(this)
                    )}
                </div>
            );
        }
    });
}));