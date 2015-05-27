/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(require('react'));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(['react'], factory);
	}
	else {
		// Global (browser)
		root.ManageProjectStep = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            if (this.props.isNew) {
                
                var steps = _.where(projectStepStore.updates.value, { projectId: this.props.projectId, parentId: this.props.parentId });
                var nextOrdinal = 1;
                if (steps.length > 0) {
                    steps = _.sortBy(steps, function (item) {
                        return item.ordinal;
                    });
                    steps.reverse();
                    nextOrdinal = steps[0].ordinal + 1;
                }
                
                var state = Object.assign({}, {
                    id: hlcommon.uuid(),
                    projectId: this.props.projectId,
                    parentId: this.props.parentId,
                    name: '',
                    kind: 'Step',
                    status: 'Todo',
                    created: (new Date()).toISOString(),
                    content: null,
                    ordinal: nextOrdinal,
                    tagName: null
                });
                return state;
            } else {
                var projectStep = _.find(projectStepStore.updates.value, { id: this.props.projectStepId });
                return {
                    id: projectStep.id,
                    projectId: projectStep.projectId,
                    parentId: projectStep.parentId,
                    name: projectStep.name,
                    kind: projectStep.kind,
                    status: projectStep.status,
                    created: projectStep.created,
                    content: projectStep.content,
                    ordinal: projectStep.ordinal,
                    tagName: projectStep.tagName
                };   
            }
        },
        
        componentWillReceiveProps: function (nextProps) {
            var projectStep = _.find(projectStepStore.updates.value, { id: nextProps.projectStepId });
            this.setState({
                id: projectStep.id,
                projectId: projectStep.projectId,
                parentId: projectStep.parentId,
                name: projectStep.name,
                kind: projectStep.kind,
                status: projectStep.status,
                created: projectStep.created,
                content: projectStep.content,
                ordinal: projectStep.ordinal,
                tagName: projectStep.tagName
            });
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            ui.goTo('Project View', { projectId: this.props.projectId });
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            } else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({kind: event.target.value});
            } else if (event.target === this.refs.tagName.getDOMNode()) {
                this.setState({tagName: event.target.value});
            } else if (event.target === this.refs.content.getDOMNode()) {
                this.setState({content: event.target.value});
            } else if (event.target === this.refs.ordinal.getDOMNode()) {
                var ord = null;
                try {
                    ord = parseInt(event.target.value);
                } catch (e) {
                    
                }
                this.setState({ordinal: ord});
            }
        },
        handleDeleteClick: function () {
            var project = _.find(projectStore.updates.value, { id: this.props.projectId });
            ui.goTo('Project View', { projectId: this.props.projectId });
            projectStepStore.destroy(this.state);
        },
        handleSaveClick: function () {
            if (this.props.isNew) {
                projectStepStore.create(this.state);
            } else {
                projectStepStore.update(this.state);
            }
            ui.goTo('Project View', { projectId: this.props.projectId });
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var buttonStyle = {
                display: 'block',
                width: '100%',
                marginBottom: '5px',
                fontSize: '1.1rem'
            };
            
            var deleteButtonStyle = Object.assign({}, buttonStyle, {
                marginTop: '3rem'
            });
            
            var buttons = [
                {type: 'primary', 
                 text: 'Save Changes',
                 handler: this.handleSaveClick,
                 buttonStyle: buttonStyle},
                {type: 'default', 
                 text: 'Cancel', 
                 handler: this.handleCancelClick,
                 buttonStyle: buttonStyle}, 
                {type: 'danger', 
                 text: 'Delete', 
                 handler: this.handleDeleteClick,
                 buttonStyle: deleteButtonStyle} 
            ];
            
            var buttonsDom = buttons.map(function(button, index) {
                return <button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>
            });
            
            // html
            return (
                <div style={{padding: '5px'}}>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="f2">What kind of project step is this?</label>
                            <select id="f2" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Step">Step</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="f1">What best titles this {this.state.kind.toLowerCase()}?</label>
                            <input id="f1" ref="name" type="text" className="form-control" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f4">What tag should be associated with this {this.state.kind.toLowerCase()}?</label>
                            <input id="f4" ref="tagName" type="text" className="form-control" value={this.state.tagName} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f3">Anything else you'd like to add about this {this.state.kind.toLowerCase()}?</label>
                            <input id="f3" ref="content" type="text" className="form-control" value={this.state.content} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f4">What ordinal?</label>
                            <input id="f4" ref="ordinal" type="number" className="form-control" value={this.state.ordinal} onChange={this.handleChange} />
                        </div>
                    </form>
                    {buttonsDom}
                </div>
            );
        }
    });
}));