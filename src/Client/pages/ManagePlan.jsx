(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/PlanStore')
    );
}(function (React, planStore) {
    var ManagePlan = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            if (!this.props.planId) {
                return {
                    id: '',
                    name: '',
                    kind: '',
                    tagName: '',
                    content: ''
                };
            }
            var plan = planStore.get(this.props.planId);
            return {
                id: plan.id,
                name: plan.name,
                kind: plan.kind,
                tagName: plan.tagName,
                content: plan.content
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillReceiveProps: function (nextProps) {
            var plan = planStore.get(nextProps.planId);
            this.setState({
                id: plan.id,
                name: plan.name,
                kind: plan.kind,
                content: plan.content
            });
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            window.location.href = '/doozy/plans';
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
            var plan = _.find(planStore.updates.value, { id: this.props.planId });
            window.location.href = '/doozy/plans';
            planStore.destroy(plan);
        },
        handleSaveClick: function () {
            planStore.update(this.state);
            window.location.href = '/doozy/plans';
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

            var buttonsDom = buttons.map(function (button, index) {
                return (<button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>);
            });

            // html
            return (
                <div style={styles.main}>
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

    return ManagePlan;
}));
