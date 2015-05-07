/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('./ActionRow'),
            require('../../../../../babble/src/durations')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            './ActionRow',
            '../../../../../babble/src/durations'
        ], factory);
	}
	else {
		// Global (browser)
		root.RecentActivity = factory(root.React, root.ActionRow, root.babble);
	}
}(this, function (React, ActionRow, babble) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return { 
                showAll: false,
                logEntriesLastUpdated: new Date().toISOString()
            };
        },
        componentWillMount: function () {
            /**
             * Subscribe to Action Store to be 
             * notified of updates to the store
             */
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleLogEntryStoreUpdate: function (logEntries) {
            this.setState({logEntriesLastUpdated: new Date().toISOString()});
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var actionIds = _.pluck(this.props.actions, 'id');
            var logEntries = logEntryStore.updates.value.filter( function (item) {
                return actionIds.indexOf(item.actionId) > -1;
            });
            logEntries = _.sortBy(logEntries, function(item){ return item.date.split('T')[0] + '-' + (item.entry === 'performed' ? '1' : '0'); });
            logEntries.reverse();

            // html
            return (
                <div style={{ marginTop: '5px' }}>
                    <div className="table-title" style={{ color: '#12AB31', backgroundColor: '#444' }}>Recent Activity<button type="button" style={{paddingTop: '3px', paddingBottom: '3px' }} className="btn btn-primary pull-right" onClick={ui.logAction}>Log a recent action</button></div>
                    
                    <div className={'log-entries ' + (this.props.hidden ? 'hidden' : '')} style={{padding: '5px'}}>
                        {logEntries.map(
                            function(item) {
                                return (<LogEntryBox data={item} />);
                            }.bind(this)
                        )}
                    </div>
                </div>
            );
        }
    });
 }));