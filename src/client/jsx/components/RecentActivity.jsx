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
                maxReturn: 5,
                logEntriesLastUpdated: new Date().toISOString()
            };
        },
        componentWillMount: function () {
            /**
             * Subscribe to Action Store to be 
             * notified of updates to the store
             */
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
            var me = this;
            $(window).scroll(function() {
               if($(window).scrollTop() + $(window).height() == $(document).height()) {
                   me.setState({ maxReturn: me.state.maxReturn + 5});
               }
            });
        },
        componentWillReceiveProps: function (nextProps) {
            if (nextProps.actions && nextProps.actions.length && nextProps.actions[0].tags[0] !== this.props.actions[0].tags[0]) {
                this.setState({
                    maxReturn: 5
                });
            }
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
                return item.entry !== 'created' && actionIds.indexOf(item.actionId) > -1;
            });
            
            logEntries = _.sortBy(logEntries, function(item){ return hlapp.getComparableLocalDateString(item.date) + '-' + (item.entry === 'performed' ? '1' : '0'); });
            logEntries.reverse();

            logEntries = logEntries.slice(0, this.state.maxReturn);
            
            // html
            return (
                <div style={{ marginTop: '5px' }}>
                    <div className="table-title" style={{ color: '#e2ff63', backgroundColor: '#444', paddingBottom: '0' }}>Recent Activity<button type="button" style={{paddingTop: '3px', paddingBottom: '3px', backgroundImage: 'none', color: '#444', backgroundColor: '#e2ff63', borderColor: '#e2ff63', fontWeight: 'bold', outlineColor: 'rgb(40, 40, 40)' }} className="btn pull-right" onClick={ui.logAction}>Log a recent action</button></div>
                    
                    <div className={'log-entries ' + (this.props.hidden ? 'hidden' : '')}>
                        {logEntries.map(
                            function(item) {
                                return (<LogEntryBox key={item.id} data={item} />);
                            }.bind(this)
                        )}
                    </div>
                </div>
            );
        }
    });
 }));