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
            connectionStore.subscribe(this.handleConnectionStoreUpdate);
            this.handleConnectionStoreUpdate(connectionStore.updates.value);
        },
        componentWillUnmount: function () {
            connectionStore.dispose(this.handleConnectionStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleConnectionStoreUpdate: function (connections) {
            this.setState({connectionsLastUpdated: new Date().toISOString()});
        },
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var userName = this.props.userName;
            
            // find existing connection
            var connections = connectionStore.updates.value;
            
            var index = -1;
            for (var i = 0; i < connections.length; i++) {
                if (connections[i].userName === userName) {
                    index = i;
                    break;
                }
            }
            
            if (index === -1 || !connections[index].logEntries) {
                return null;   
            }
            
            var logEntries = _.sortBy(connections[index].logEntries, function (item) { return item.date});
            logEntries.reverse();
            
            return (
                <div className={'log-entries ' + (this.props.hidden ? 'hidden' : '')} style={{padding: '5px'}}>
                    {logEntries.map(
                        function(item) {
                            return (<LogEntryBox connection={connections[index]} data={item} />);
                        }.bind(this)
                    )}
                </div>
            );
        }
    });
}));