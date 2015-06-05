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
		root.ManageTargets = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({

        getInitialState: function () {
            return {
                targetsLastUpdated: (new Date()).toISOString()  
            };
        },
        
        componentWillMount: function () {
            /**
             * Subscribe to Target Store to be 
             * notified of updates to the store
             */
            this.targetsObserver = targetStore.updates
                .subscribe(this.handleTargetStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.targetsObserver.dispose();
        },

        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            ui.goBack();
        },
        handleTargetClick: function (target) {
            ui.goTo('Manage Target', {targetId: target.id});
        },
        handleTargetStoreUpdate: function (targets) {
            this.setState({ targetsLastUpdated: (new Date()).toISOString() });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var targets = targetStore.updates.value.slice();
            
            /**
             * Sort the actions by completed and name
             */
            targets = _.sortBy(targets, function(target){ 
                return target.name.toLowerCase();
            })
            targets.reverse();
            targets.push(hlapp.target());
            targets.reverse();
            
            /**
             * Inline Styles
             */
            var headerStyle = {
                display: 'flex',
                flexDirection: 'row',
                color: '#e2ff63', 
                backgroundColor: '#444', 
                padding: '2px 2px 0 8px',
                fontWeight: 'bold',
                fontSize: '1.5em'
            };
        
            var targetStyle = {
                fontSize: 'large',
                padding: '5px',
                borderBottom: 'solid 1px #e0e0e0'
            };
            
            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Targets</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>                    
                        {targets.map(function(item, index) {
                            return (
                                <div key={item.id} className="clickable" style={targetStyle} onClick={this.handleTargetClick.bind(null, item)}>
                                    <span>{item.name}</span>
                                </div>
                            );
                        }.bind(this))}
                    </div>  
                </div>
            );
        }
    });
 }));