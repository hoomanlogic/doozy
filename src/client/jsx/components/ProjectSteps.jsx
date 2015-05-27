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
        handleAddStepClick: function () {
            var stepName = prompt('What is the name of the step?', '');
            if (!stepName) {
                return false;   
            }
            
            var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parentId: null });
            var nextOrdinal = 1;
            if (steps.length > 0) {
                steps = _.sortBy(steps, function (item) {
                    return item.ordinal;
                });
                steps.reverse();
                nextOrdinal = steps[0].ordinal + 1;
            }
            
            projectStepStore.create({
                id: hlcommon.uuid(),
                projectId: this.props.projectId,
                parentId: null,
                name: stepName,
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                ordinal: nextOrdinal
            });
            
            this.setState({ projectsLastUpdated: (new Date()).toISOString() });
            
            return false;
        },
        handleProjectStepStoreUpdate: function (projectSteps) {
            this.setState({ projectStepsLastUpdated: (new Date()).toISOString() });
        },
        handleCloseClick: function () {
            ui.goBack();
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            
            // get root level steps for this project
            var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parentId: null });
            var childrenCount = 0;
            
            steps = _.sortBy(steps, function (item) {
                
                var children = _.where(projectStepStore.updates.value, { projectId: item.projectId, parentId: item.id });
                childrenCount += children.length || 1;
                return item.ordinal;
            });
            
            var projectId = this.props.projectId;
            var project = _.find(projectStore.updates.value, function (item) {
                return item.id === projectId;
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
                paddingTop: '3px', 
                paddingBottom: '3px', 
                backgroundImage: 'none', 
                color: '#444', 
                backgroundColor: '#e2ff63', 
                borderColor: '#e2ff63', 
                fontWeight: 'bold', 
                outlineColor: 'rgb(40, 40, 40)'
            };
            
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>{project.name}</div>
                        <button type="button" style={buttonStyle} className="btn" onClick={this.handleAddStepClick}>+</button>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{ overflowX: 'auto', paddingBottom: '5px' }}>
                        <div style={{ width: (childrenCount * 190) + 'px' }}>
                            <ul style={{listStyle: 'none', padding: '0', margin: '0', overflow: 'hidden', width: '100%'}}>
                                {steps.map( function (step) {
                                    return (
                                        <ProjectStep projectId={this.props.projectId} data={step} level={1} />
                                    );
                                }.bind(this))}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    });
 }));