(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('components/Uploader'),
        require('stores/FocusStore'),
    );
}(function (React, Uploader, focusStore) {
    var ManageFocus = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                isNew: this.props.currentFocus.isNew || false,
                id: this.props.currentFocus.id,
                ref: this.props.currentFocus.id,
                name: this.props.currentFocus.name,
                kind: this.props.currentFocus.kind,
                tagName: this.props.currentFocus.tagName,
                filesSelected: false
            };
        },


        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillReceiveProps: function (nextProps) {
            if (nextProps.currentFocus.id !== this.state.id) {
                this.setState({
                    isNew: nextProps.currentFocus.isNew || false,
                    id: nextProps.currentFocus.id,
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
            ui.goBack();
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
        handleOnFileChange: function (filesSelected) {
            this.setState({
                filesSelected: filesSelected
            });
        },
        handleSaveClick: function () {
            if (!this.state.isNew) {
                focusStore.update(this.state);
            } else {
                focusStore.create({
                    id: this.state.id,
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
            var buttonStyle = {
              display: 'block',
              width: '100%',
              marginBottom: '5px',
              fontSize: '1.1rem'
            };

            var currentImage;
            if (!this.state.filesSelected) {
                currentImage = (<img style={{display: 'inline', maxWidth: '100px', maxHeight: '100px'}} src={this.props.currentFocus.iconUri} />);
            }
            //<button style={buttonStyle} type="button" className="btn btn-danger" onClick={this.handleDeleteClick}>Delete Focus</button>

            // html
            return (
                <div style={styles.main}>
                    <form role="form">
                        <label>What picture best represents this focus?</label>
                        {currentImage}
                        <Uploader type="Focus" arg={this.state.id} onFileChange={this.handleOnFileChange} />
                        <div className="form-group">
                            <label htmlFor="f2">What kind of focus is this?</label>
                            <select id="f2" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Role">Role</option>
                                <option value="Path">Path</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="f1">What {this.state.kind.toLowerCase()} does this focus represent?</label>
                            <input id="f1" ref="name" type="text" className="form-control" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f3">What tag-word should be connected to this focus?</label>
                            <input id="f3" ref="tagname" type="text" className="form-control" value={this.state.tagName} onChange={this.handleChange} />
                        </div>
                        <button style={buttonStyle} type="button" className="btn btn-primary" onClick={this.handleSaveClick}>Save Changes</button>
                        <button style={buttonStyle} type="button" className="btn btn-default" onClick={this.handleCancelClick}>Cancel</button>

                    </form>
                </div>
            );
        }
    });
    
    var styles = {
        main: {
            padding: '1rem',
            margin: 'auto',
            maxWidth: '40rem'
        }
    };

    return ManageFocus;
}));
