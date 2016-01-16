(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy'),
        require('stores/host'),
        require('stores/tag-store'),
        require('mixins/ModelMixin')
    );
}(function (React, doozy, host, tagStore, ModelMixin) {
    var ManageTag = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [ModelMixin(tagStore)],
        propTypes: {
            id: React.PropTypes.string,
        },
        getInitialState: function () {
            return doozy.tag();
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Tag');
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            host.go('/doozy/tags');
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            }
            else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({kind: event.target.value});
            }
            else if (event.target === this.refs.content.getDOMNode()) {
                this.setState({content: event.target.value});
            }
        },
        handleDeleteClick: function () {
            tagStore.destroy(this.props.id);
            host.go('/doozy/tags');
        },
        handleSaveClick: function () {
            if (this.props.id) {
                tagStore.update(this.state);
            }
            else {
                tagStore.create(this.state);
            }
            host.go('/doozy/tags');
        },
        handleModelUpdate: function (model) {
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

            var buttonsDom = buttons.map(function (button, index) {
                return (<button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>);
            });

            // html
            return (
                <div style={styles.main}>
                    <h2>{this.state.isNew ? 'New Tag' : 'Update Tag'}</h2>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="f2">What kind of tag is this?</label>
                            <select id="f2" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Focus">Focus</option>
                                <option value="Goal">Goal</option>
                                <option value="Need">Need</option>
                                <option value="Place">Place</option>
                                <option value="Box">Box</option>
                                <option value="Tag">General Tag</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="f1">What {this.state.kind.toLowerCase()} does this tag represent?</label>
                            <input id="f1" ref="name" type="text" className="form-control" value={this.state.name} onChange={this.handleChange} />
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

    var styles = {
        main: {
            padding: '1rem',
            margin: 'auto',
            maxWidth: '40rem'
        }
    };

    var buttonStyle = {
        display: 'block',
        width: '100%',
        marginBottom: '5px',
        fontSize: '1.1rem'
    };

    var deleteButtonStyle = Object.assign({}, buttonStyle, {
        marginTop: '3rem'
    });

    return ManageTag;
}));
