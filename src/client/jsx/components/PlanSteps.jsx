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
		window.PlanSteps = factory(window.React);
	}
}(function (React) {
    'use strict';
    return React.createClass({

        getInitialState: function () {
            return {
                planStepsLastUpdated: (new Date()).toISOString()  
            };
        },
        
        componentWillMount: function () {
            /**
             * Subscribe to Tag Store to be 
             * notified of updates to the store
             */
            this.planStepsObserver = planStepStore.updates
                .subscribe(this.handlePlanStepStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.planStepsObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handlePlanStepStoreUpdate: function (planSteps) {
            this.setState({ planStepsLastUpdated: (new Date()).toISOString() });
        },
        handleCloseClick: function () {
            ui.goBack();
        },
        
        calculateNewStep: function () {
            var steps = _.where(planStepStore.updates.value, { planId: this.props.planId, parentId: null });
            var nextOrdinal = 1;
            if (steps.length > 0) {
                steps = _.sortBy(steps, function (item) {
                    return item.ordinal;
                });
                steps.reverse();
                nextOrdinal = steps[0].ordinal + 1;
            }
            
            return {
                id: hlcommon.uuid(),
                planId: this.props.planId,
                parentId: null,
                name: '+',
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                ordinal: nextOrdinal,
                isNew: true
            };
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            
            // get root level steps for this plan
            var steps = _.where(planStepStore.updates.value, { planId: this.props.planId, parentId: null });
            var childrenCount = 1;
            
            steps = _.sortBy(steps, function (item) {
                
                var children = _.where(planStepStore.updates.value, { planId: item.planId, parentId: item.id });
                childrenCount += children.length + 1;
                return item.ordinal;
            });
            
            var planId = this.props.planId;
            var plan = _.find(planStore.updates.value, function (item) {
                return item.id === planId;
            });
            
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
            
            var buttonStyle = { 
                paddingTop: '1px', 
                paddingBottom: '1px',
                height: '25px',
                margin: '1px 8px 0 0',
                backgroundImage: 'none', 
                color: '#444', 
                backgroundColor: '#e2ff63', 
                borderColor: '#e2ff63', 
                fontWeight: 'bold', 
                outlineColor: 'rgb(40, 40, 40)'
            };
            
            var stepsDom = steps.map( function (step) {
                return (
                    <PlanStep planId={this.props.planId} data={step} level={1} />
                );
            }.bind(this))
            
            stepsDom.push((
                <PlanStep planId={this.props.planId} data={this.calculateNewStep()} level={1} />
            ));

            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>{plan.name}</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{ overflowX: 'auto', paddingBottom: '5px' }}>
                        <div style={{ width: (childrenCount * 190) + 'px' }}>
                            <ul style={{listStyle: 'none', padding: '0', margin: '0', overflow: 'hidden', width: '100%'}}>
                                {stepsDom}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    });
 }));