(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy'),
        require('stores/host'),
        require('stores/focus-store'),
        require('mixins/ModelMixin')
    );
}(function (React, doozy, host, focusStore, ModelMixin) {
    var ManageFocus = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [ModelMixin(focusStore)],
        propTypes: {
            id: React.PropTypes.string,
        },
        getInitialState: function () {
            return doozy.focus();
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Focus');
        },

        // getInitialState: function () {
        //     return {
        //         isNew: this.props.currentFocus.isNew || false,
        //         id: this.props.currentFocus.id,
        //         ref: this.props.currentFocus.id,
        //         name: this.props.currentFocus.name,
        //         kind: this.props.currentFocus.kind,
        //         tagName: this.props.currentFocus.tagName,
        //         filesSelected: false
        //     };
        // },


        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        // componentWillReceiveProps: function (nextProps) {
        //     if (nextProps.currentFocus.id !== this.state.id) {
        //         this.setState({
        //             isNew: nextProps.currentFocus.isNew || false,
        //             id: nextProps.currentFocus.id,
        //             name: nextProps.currentFocus.name,
        //             kind: nextProps.currentFocus.kind,
        //             tagName: nextProps.currentFocus.tagName
        //         });
        //     }
        // },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            host.go('/doozy/focuses');
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            }
            else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({kind: event.target.value});
            }
            else if (event.target === this.refs.tagname.getDOMNode()) {
                this.setState({tagName: event.target.value});
            }
        },
        handleDeleteClick: function () {
            host.prompt('Are you sure you want to delete this focus?\n\nIf so, type DELETE and hit enter', function (response) {
                if ((response || '').toLowerCase() === 'delete') {
                    focusStore.destroy(this.props.id);
                    host.go('/doozy/focuses');
                }
            }.bind(this));
        },
        handleSaveClick: function () {
            if (this.props.id) {
                focusStore.update(this.state);
            }
            else {
                focusStore.create(this.state);
            }
            host.go('/doozy/focuses');
        },
        handleModelUpdate: function (model) {
            if (!model) {
                this.setState(this.getInitialState());    
                return;
            }
            this.setState(model);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // Waiting on store
            if (this.props.id && this.state.isNew) {
                return <div>Loading...</div>;
            }

            // var currentImage;
            // if (!this.state.filesSelected) {
            //     currentImage = (<img style={{display: 'inline', maxWidth: '100px', maxHeight: '100px'}} src={this.props.currentFocus.iconUri} />);
            // }
            // <button style={buttonStyle} type="button" className="btn btn-danger" onClick={this.handleDeleteClick}>Delete Focus</button>

            // TODO: Re-Implement Uploader
            // <label>What picture best represents this focus?</label>
            // {currentImage}
            // <Uploader type="Focus" arg={this.state.id} onFileChange={this.handleOnFileChange} />

            // html
            return (
                <div style={styles.main}>
                    <h2>{this.state.isNew ? 'New Focus' : 'Update Focus'}</h2>
                    <form role="form">
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
                    </form>
                    {this.renderButtons()}
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
