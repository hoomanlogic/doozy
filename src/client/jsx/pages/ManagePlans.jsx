// CommonJS, AMD, and Global shim
(function (factory) {
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
		window.ManagePlans = factory(window.React);
	}
}(function (React) {
    'use strict';
    return React.createClass({

        getInitialState: function () {
            return {
                plansLastUpdated: (new Date()).toISOString()  
            };
        },
        
        componentWillMount: function () {
            /**
             * Subscribe to Tag Store to be 
             * notified of updates to the store
             */
            this.plansObserver = planStore.updates
                .subscribe(this.handlePlanStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.plansObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            ui.goBack();
        },
        handlePlanClick: function (plan) {
            ui.goTo('Plan View', {planId: plan.id});
        },
        handleEditPlanDetailsClick: function (plan) {
            ui.goTo('Manage Plan', {planId: plan.id});
        },
        handlePlanStoreUpdate: function (plans) {
            this.setState({ plansLastUpdated: (new Date()).toISOString() });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var plans = planStore.updates.value;
            
            /**
             * Sort the actions by completed and name
             */
            plans = _.sortBy(plans, function(plan){ 
                return plan.name.toLowerCase();
            })

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
                        <div style={{flexGrow: '1'}}>Plans</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>                    
                        {plans.map(function(item, index) {
                            return (
                                <div key={item.id} style={listItemStyle}>
                                    <div style={{flexGrow: '1'}}>
                                        <span className="clickable" onClick={this.handlePlanClick.bind(null, item)}>{item.name}</span>
                                    </div>
                                    <div>
                                        <button type="button" style={buttonStyle} className="btn" onClick={this.handleEditPlanDetailsClick.bind(null, item)}><i className="fa fa-pencil"></i></button>
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