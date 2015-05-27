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
		root.ManageProjects = factory(root.React);
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
            this.projectsObserver = projectStore.updates
                .subscribe(this.handleProjectStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.projectsObserver.dispose();
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleAddStepClick: function (project) {
            var stepName = prompt('What is the name of the step?', '');
            
            projectStepStore.create({
                id: hlcommon.uuid(),
                projectId: project.id,
                name: stepName,
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                level: 1,
                parent: null,
                ordinal: 1
            });
            
            return false;
        },
        handleCloseClick: function () {
            ui.goBack();
        },
        handleProjectClick: function (project) {
            ui.goTo('Manage Project', {projectId: project.id});
        },
        handleProjectStoreUpdate: function (projects) {
            this.setState({ projectsLastUpdated: (new Date()).toISOString() });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var projects = projectStore.updates.value;

            /**
             * Sort the actions by completed and name
             */
            projects = _.sortBy(projects, function(project){ 
                return project.name.toLowerCase();
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
                        <div style={{flexGrow: '1'}}>Projects</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>                    
                        {projects.map(function(item, index) {
                            var steps = _.where(projectStepStore.updates.value, { projectId: item.id, parent: null, level: 1 });
                
                            var stepsDom = steps.map( function (s) {
                                return (
                                    <ProjectStep projectId={item.id} data={s} />
                                );
                            });
                
                            return (
                                <div key={item.id} className="clickable" style={listItemStyle} onClick={this.handleProjectClick.bind(null, item)}>
                                    <div>
                                        <span>{item.name}</span>
                                        <button type="button" style={buttonStyle} className="btn pull-right" onClick={this.handleAddStepClick.bind(null, item)}>+</button>
                                    </div>
                                    {stepsDom}
                                </div>
                            );
                        }.bind(this))}
                    </div>  
                </div>
            );
        }
    });
 }));