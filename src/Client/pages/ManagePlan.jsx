(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy'),
        require('stores/host'),
        require('stores/plan-store'),
        require('mixins/ModelMixin')
    );
}(function (React, doozy, host, planStore, ModelMixin) {
    var ManagePlan = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [ModelMixin(planStore)],
        propTypes: {
            id: React.PropTypes.string,
        },
        getInitialState: function () {
            return doozy.plan();
        },
        componentWillMount: function () {
            host.setTitle('Plan');
        },
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            host.go('/doozy/plans');
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            }
            else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({kind: event.target.value});
            }
            else if (event.target === this.refs.tagName.getDOMNode()) {
                this.setState({tagName: event.target.value});
            }
            else if (event.target === this.refs.content.getDOMNode()) {
                this.setState({content: event.target.value});
            }
        },
        handleDeleteClick: function () {
            host.prompt('Are you sure you want to delete this plan?\n\nIf so, type DELETE and hit enter', function (response) {
                if ((response || '').toLowerCase() === 'delete') {
                    planStore.destroy(this.props.id);
                    host.go('/doozy/plans');
                }
            }.bind(this));
        },
        handleSaveClick: function () {
            if (this.props.id) {
                planStore.update(this.state);
            }
            else {
                planStore.create(this.state);
            }
            host.go('/doozy/plans');
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

            // html
            return (
                <div style={styles.main}>
                    <h2>{this.state.isNew ? 'New Plan' : 'Update Plan'}</h2>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="f2">What kind of plan is this?</label>
                            <select id="f2" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Plan">Simple</option>
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

    return ManagePlan;
}));
