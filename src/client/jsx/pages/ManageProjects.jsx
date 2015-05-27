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
        handleCloseClick: function () {
            ui.goBack();
        },
        handleProjectClick: function (project) {
            ui.goTo('Project View', {projectId: project.id});
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

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Projects</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>                    
                        {projects.map(function(item, index) {
                            return (
                                <div key={item.id} style={listItemStyle}>
                                    <div>
                                        <span className="clickable" onClick={this.handleProjectClick.bind(null, item)}>{item.name}</span>
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