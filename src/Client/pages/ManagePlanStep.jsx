(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('babble'),
        require('stores/planstep-store'),
        require('mixins/SubscriberMixin')
    );
}(function (React, _, doozy, babble, planStepStore, SubscriberMixin) {
    var ManagePlanStep = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [SubscriberMixin(planStepStore)],

        getInitialState: function () {
            return doozy.planstep(this.props.planId, this.props.parentId);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            window.location.href = '/doozy/plansteps/' + this.props.planId;
        },
        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                this.setState({name: event.target.value});
            }
            else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({kind: event.target.value});
            }
            else if (event.target === this.refs.status.getDOMNode()) {
                this.setState({status: event.target.value});
            }
            else if (event.target === this.refs.tagName.getDOMNode()) {
                this.setState({tagName: event.target.value});
            }
            else if (event.target === this.refs.content.getDOMNode()) {
                this.setState({content: event.target.value});
            }
            else if (event.target === this.refs.duration.getDOMNode()) {
                var durationParsed = babble.get('durations').translate(this.refs.duration.getDOMNode().value.trim());
                var duration = 0;
                var durationDisplay = '';
                if (durationParsed.tokens.length > 0) {
                    duration = durationParsed.tokens[0].value.toMinutes();
                    durationDisplay = durationParsed.tokens[0].value.toString('minutes');
                }

                this.state.duration = duration;
                this.state.durationInput = this.refs.duration.getDOMNode().value;
                this.state.durationDisplay = durationDisplay;
                this.setState({
                    duration: duration,
                    durationInput: this.refs.duration.getDOMNode().value,
                    durationDisplay: durationDisplay
                });
            }
            else if (event.target === this.refs.ordinal.getDOMNode()) {
                var ord = null;
                try {
                    ord = parseInt(event.target.value, 10);
                }
                catch (e) {
                    console.log(e);
                }
                this.setState({ordinal: ord});
            }
        },
        handleDeleteClick: function () {
            planStepStore.destroy(this.props.planStepId);
            window.location.href = '/doozy/plansteps/' + this.props.planId;
        },
        handleSaveClick: function () {
            if (this.props.isNew) {
                planStepStore.create(this.state);
            }
            else {
                planStepStore.update(this.state);
            }
            window.location.href = '/doozy/plansteps/' + this.props.planId;
        },
        handleStoreUpdate: function (model) {
            // Generate duration input from numeric value
            var durationParse = babble.get('durations').translate((model.duration || 0) + ' min');
            var durationInput = null;
            if (durationParse.tokens.length !== 0) {
                durationInput = durationParse.tokens[0].value.toString();
            }

            var state = Object.assign({}, model, {
                durationInput: durationInput
            });

            if (this.props.isNew) {
                var steps = planStepStore.getChildren(this.props.parentId, this.props.planId);
                var nextOrdinal = 1;
                if (steps.length > 0) {
                    steps = _.sortBy(steps, function (item) {
                        return item.ordinal;
                    });
                    steps.reverse();
                    nextOrdinal = steps[0].ordinal + 1;
                }
                state.ordinal = nextOrdinal;
            }

            this.setState(state);
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
                return <button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>;
            });

            // html
            return (
                <div style={styles.main}>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="planstep-kind">What kind of plan step is this?</label>
                            <select id="planstep-kind" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="Milestone">Milestone</option>
                                <option value="Step">Step</option>
                                <option value="Action">Action</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="planstep-name">What best titles this {this.state.kind.toLowerCase()}?</label>
                            <input id="planstep-name" ref="name" type="text" className="form-control" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="planstep-duration">How long do you think it will take?</label>
                            <input id="planstep-duration" ref="duration" type="text" className="form-control" value={this.state.durationInput} onChange={this.handleChange} />
                            <span>{this.state.durationDisplay}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="planstep-status">What is the status of this step?</label>
                            <select id="planstep-status" ref="status" className="form-control" value={this.state.status} onChange={this.handleChange}>
                                <option value="Todo">Todo</option>
                                <option value="Doing">Doing</option>
                                <option value="Ready">Ready</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="planstep-tagname">What tag should be associated with this {this.state.kind.toLowerCase()}?</label>
                            <input id="f4" ref="tagName" type="text" className="form-control" value={this.state.tagName} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="planstep-ordinal">What ordinal?</label>
                            <input id="planstep-ordinal" ref="ordinal" type="number" className="form-control" value={this.state.ordinal} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="planstep-content">Anything else you'd like to add about this {this.state.kind.toLowerCase()}?</label>
                            <input id="planstep-content" ref="content" type="textarea" className="form-control" value={this.state.content} onChange={this.handleChange} />
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

    return ManagePlanStep;
}));
