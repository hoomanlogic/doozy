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
		root.ProjectSteps = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({

        getInitialState: function () {
            return {
                projectStepsLastUpdated: (new Date()).toISOString()  
            };
        },
        
        componentWillMount: function () {
            /**
             * Subscribe to Tag Store to be 
             * notified of updates to the store
             */
            this.projectStepsObserver = projectStepStore.updates
                .subscribe(this.handleProjectStepStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.projectStepsObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleProjectStepStoreUpdate: function (projectSteps) {
            this.setState({ projectStepsLastUpdated: (new Date()).toISOString() });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            
            // get root level steps for this project
            var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parentId: null });
            steps = _.sortBy(steps, function (item) {
                return item.ordinal;
            });
            
            return (
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    {steps.map( function (step) {
                        return (
                            <ProjectStep projectId={this.props.projectId} data={step} level={1} />
                        );
                    }.bind(this))}
                </div>
            );
        }
    });
 }));