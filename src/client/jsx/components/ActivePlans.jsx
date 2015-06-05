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
		root.ActivePlans = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        getActivePlans: function () {
            var focusTag = this.props.focusTag.slice(1);
            var focus = _.find(focusStore.updates.value, function (item) {
                return item.tagName === focusTag;
            });
            if (!focus) {
                return [];   
            }
            var plans = _.where(planStore.updates.value, { focusId: focus.id });
            return plans;
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handlePlanClick: function (plan) {
            ui.goTo('Plan View', {planId: plan.id});
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var activePlans = this.getActivePlans()

            /**
             * Sort the actions by completed and name
             */
            activePlans = _.sortBy(activePlans, function(plan){ 
                return plan.name.toLowerCase(); 
            })

            /**
             * Return null if there are no active plans for this focus
             */
            if (activePlans.length === 0) {
                return null;
            }

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
        
            var listItemStyle = {
                display: 'flex',
                flexDirection: 'row',
                fontSize: 'large',
                padding: '5px',
                borderBottom: 'solid 1px #e0e0e0'
            };

            var buttonStyle = { 
                paddingTop: '3px', 
                paddingBottom: '3px', 
                backgroundImage: 'none', 
                color: '#444', 
                backgroundColor: '#e2ff63', 
                borderColor: '#e2ff63', 
                fontWeight: 'bold', 
                outlineColor: 'rgb(40, 40, 40)' 
            };
        
            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div>Active Plans</div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>                    
                        {activePlans.map(function(item, index) {
                            return (
                                <div key={item.id} style={listItemStyle}>
                                    <div style={{flexGrow: '1'}}>
                                        <span className="clickable" onClick={this.handlePlanClick.bind(null, item)}>{item.name}</span>
                                    </div>
                                </div>
                            );
                        }.bind(this))}
                    </div>  
                </div>
            );
        }
    });
 }));