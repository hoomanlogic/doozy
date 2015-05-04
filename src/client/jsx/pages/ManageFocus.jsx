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
		root.ManageFocus = factory(root.React);
	}
}(this, function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                isNew: this.props.currentFocus.isNew || false,
                id: this.props.currentFocus.id,
                ref: this.props.currentFocus.id,
                name: this.props.currentFocus.name,
                kind: this.props.currentFocus.kind,
                tagName: this.props.currentFocus.tagName
            };
        },
        componentWillReceiveProps: function (nextProps) {
            if (nextProps.currentFocus.id !== this.state.id) {
                this.setState({
                    isNew: nextProps.currentFocus.isNew || false,
                    id: nextProps.currentFocus.id,
                    ref: nextProps.currentFocus.ref,
                    name: nextProps.currentFocus.name,
                    kind: nextProps.currentFocus.kind,
                    tagName: nextProps.currentFocus.tagName
                });
            };
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            ui.goTo('Do');
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            } else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({kind: event.target.value});
            } else if (event.target === this.refs.tagname.getDOMNode()) {
                this.setState({tagName: event.target.value});
            }
        },
        handleDeleteClick: function () {
            if (prompt('Are you sure you want to delete this focus?\n\nIf so, type DELETE and hit enter') === 'DELETE') {
                focusStore.destroy(this.props.currentFocus);
            }
        },
        handleSaveClick: function () {
            if (!this.state.isNew) {
                focusStore.update({ focusRef: this.state.ref, state: this.state });
            } else {
                focusStore.create({
                    id: this.state.id,
                    ref: this.state.ref,
                    name: this.state.name,
                    kind: this.state.kind,
                    tagName: this.state.tagName
                });
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // html
            return (
                <div className="row" style={{padding: '5px'}}>
                    <form role="form">
                        <Uploader type="Focus" arg={this.state.id} />
                        <div className="form-group">
                            <label htmlFor="f1">Name</label>
                            <input id="f1" ref="name" type="text" className="form-control" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f2">What kind of focus is this?</label>
                            <select id="f2" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Role">Role</option>
                                <option value="Path">Path</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="f3">Tag</label>
                            <input id="f3" ref="tagname" type="text" className="form-control" value={this.state.tagName} onChange={this.handleChange} />
                        </div>
                        <button type="button" className="btn btn-success" onClick={this.handleSaveClick}>Save Changes</button>
                        <button type="button" className="btn btn-default" onClick={this.handleCancelClick}>Cancel Changes</button>
                        <button type="button" className="btn btn-danger" onClick={this.handleDeleteClick}>Delete Focus</button>
                    </form>
                </div>
            );
        }
    });
}));