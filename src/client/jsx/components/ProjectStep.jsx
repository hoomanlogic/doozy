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
            if (!stepName) {
                return false;   
            }
            
            var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parentId: this.props.data.id });
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
                parentId: this.props.data.id,
                name: stepName,
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                ordinal: nextOrdinal
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
                //padding: '5px',
                //borderBottom: 'solid 1px #e0e0e0'
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
            
            var childStepsStyles = [
                {
                    
                },
                {
                    display: 'flex',
                    flexDirection: 'row'
                },
                {
                    display: 'flex',
                    flexDirection: 'column'
                }
            ];
            
            var stepStyles = [
                {
                  
                },
                {
                    background: '#aed9e9',
                    border: 'solid 1px #8fcbe3',
                    color: '#274e5b',
                    width: '180px',
                    minWidth: '180px',
                    height: '120px'
                },
                {
                    background: '#f4e459',
                    border: 'solid 1px #e8cf01',
                    color: '#635207',
                    width: '180px',
                    minWidth: '180px',
                    height: '120px',
                    overflow: 'auto'
                },
                {
                    background: '##fff',
                    border: 'solid 1px #cecece',
                    color: '#4f4f4f',
                    width: '180px',
                    minWidth: '180px',
                    height: '120px'
                },
            ];
            
            var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parentId: this.props.data.id });
            steps = _.sortBy(steps, function (item) {
                return item.ordinal;
            });
            
            var stepsDom = steps.map( function (step) {
                return (
                    <ProjectStep projectId={this.props.projectId} data={step} level={this.props.level + 1} />
                );
            }.bind(this));

            return (
                <div key={this.props.data.id} style={listItemStyle}>
                    <div>
                        <div style={Object.assign({}, stepStyles[this.props.level], {padding: '5px', margin: '5px'})}>
                            <span>{this.props.data.name}</span>
                            <button type="button" style={buttonStyle} className="btn pull-right" onClick={this.handleAddStepClick}>+</button>
                        </div>
                    </div>
                    <div style={childStepsStyles[this.props.level]}>
                        {stepsDom}
                    </div>
                </div>
            );
        }
    });
 }));