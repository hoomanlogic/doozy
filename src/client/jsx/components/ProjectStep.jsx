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
		root.ProjectStep = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({

        getInitialState: function () {
            return {
                projectsLastUpdated: (new Date()).toISOString()  
            };
        },
        
        componentWillMount: function () {
            /**
             * Subscribe to Tag Store to be 
             * notified of updates to the store
             */
            //this.projectsObserver = projectStore.updates
            //    .subscribe(this.handleProjectStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            //this.projectsObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleAddStepClick: function () {
            var stepName = prompt('What is the name of the step?', '');
            
            projectStepStore.create({
                id: hlcommon.uuid(),
                projectId: this.props.projectId,
                name: stepName,
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                level: this.props.data.level + 1,
                parent: this.props.data.ordinal,
                ordinal: 1
            });

            return false;
        },
        handleProjectStoreUpdate: function (projects) {
            this.setState({ projectsLastUpdated: (new Date()).toISOString() });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var projectsteps = projectStore.updates.value;

            /**
             * Sort the actions by completed and name
             */
            projectsteps = _.sortBy(projectsteps, function(step){ 
                return step.name.toLowerCase();
            })

            /**
             * Inline Styles
             */
            var listItemStyle = {
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
            
            var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parent: this.props.data.ordinal, level: this.props.data.level + 1 });

            var stepsDom = steps.map( function (step) {
                return (
                    <ProjectStep projectId={this.props.projectId} data={step} />
                );
            }.bind(this));

            return (
                <div key={this.props.data.id} className="clickable" style={listItemStyle}>
                    <div>
                        <span>{this.props.data.name}</span>
                        <button type="button" style={buttonStyle} className="btn pull-right" onClick={this.handleAddStepClick}>+</button>
                    </div>
                    {stepsDom}
                </div>
            );
        }
    });
 }));