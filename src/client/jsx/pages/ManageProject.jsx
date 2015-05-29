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
		root.ManageProject = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            if (!this.props.projectId) {
                return {
                    id: '',
                    name: '', 
                    kind: '',
                    tagName: '',
                    content: ''
                };   
            }
            var project = _.find(projectStore.updates.value, { id: this.props.projectId });
            return {
                id: project.id,
                name: project.name,
                kind: project.kind,
                tagName: project.tagName,
                content: project.content
            };
        },
        
        componentWillReceiveProps: function (nextProps) {
            var project = _.find(projectStore.updates.value, { id: nextProps.projectId });
            this.setState({
                id: project.id,
                name: project.name,
                kind: project.kind,
                content: project.content
            });
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            ui.goTo('Manage Projects');
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
            }
        },
        handleDeleteClick: function () {
            var project = _.find(projectStore.updates.value, { id: this.props.projectId });
            ui.goTo('Manage Projects');
            projectStore.destroy(project);
        },
        handleSaveClick: function () {
            projectStore.update(this.state);
            ui.goTo('Manage Projects');
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
                            <label htmlFor="f2">What kind of project is this?</label>
                            <select id="f2" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Project">Simple</option>
                                <option value="Business">Business</option>
                                <option value="Goal">Goal</option>
                                <option value="Software">Software</option>
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
                    </form>
                    {buttonsDom}
                </div>
            );
        }
    });
}));