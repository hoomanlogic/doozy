(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('stores/host'),
        require('babble'),
        require('stores/action-store'),
        require('stores/logentry-store'),
        require('stores/tag-store'),
        require('mixins/ModelMixin'),
        require('mixins/StoresMixin'),
        require('mixins/SelectActionMixin'),
        require('mixins/SelectTagsMixin')
    );
}(function (React, _, doozy, host, babble, actionStore, logEntryStore, tagStore, ModelMixin, StoresMixin, SelectActionMixin, SelectTagsMixin) {
    /* globals $ */
    var ManageLogEntry = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [ModelMixin(logEntryStore), StoresMixin([actionStore, tagStore]), SelectActionMixin, SelectTagsMixin],
        propTypes: {
            id: React.PropTypes.string
        },

        getInitialState: function () {
            var state = Object.assign(doozy.logEntry(), {
                isNewAction: false,
                dateInput: 'today',
                dateFeedback: Date.create('today').toLocaleDateString(),
                durationInput: '',
                durationFeedback: '',
            });

            if (this.props.actionId) { // Log Action
                state.actionId = this.props.actionId;
            }
            else if (this.props.actionName) { // Log New Action
                state.actionName = this.props.actionName;
            }

            return state;
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Log Entry');
        },
        componentDidMount: function () {
            // If we're still loading, then abort
            if (!this.refs.name) {
                return;
            }

            /**
             * Setup Action and Tags selector
             */
            this.setupActionsControl();
            this.setupTagsControl();

            // This must be done AFTER setupTagsControls because
            // action selectize onChange event uses the tags selectize
            var selectActions = $(this.refs.name.getDOMNode())[0].selectize;
            this.setOptionsAction(selectActions);
            selectActions.setValue(this.state.actionId || this.state.actionName || null);

            /**
             * Set focus to control
             */
            if (this.props.action && this.props.action.name && this.props.action.name.length > 0) {
                $(this.refs.actualduration.getDOMNode()).focus();
            }
            else {
                $(this.refs.name.getDOMNode())[0].selectize.focus();
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancel: function () {
            host.go('/doozy/actions');
        },
        handleChange: function (event) {
            if (event.target === this.refs.performedat.getDOMNode()) {

                var date = Date.create(event.target.value.trim());
                var dateFeedback = date.toLocaleDateString();

                var isValid = true;

                try {
                    date.toISOString();
                }
                catch (e) {
                    if (e instanceof RangeError) {
                        isValid = false;
                    }
                    else {
                        throw e;
                    }
                }

                if (isValid && (date.getHours() !== 0 || date.getMinutes() !== 0)) {
                    dateFeedback += ' ' + date.toLocaleTimeString();
                }

                this.setState({
                    date: date,
                    dateInput: event.target.value,
                    dateFeedback: dateFeedback
                });
            }
            else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({
                    kind: event.target.value
                });
            }
            else if (event.target === this.refs.actualduration.getDOMNode()) {
                var duration = 0;
                var durationParseResult = babble.get('durations').translate(this.refs.actualduration.getDOMNode().value.trim());
                var durationFeedback = '';
                if (durationParseResult.tokens.length > 0) {
                    duration = durationParseResult.tokens[0].value.toMinutes();
                    durationFeedback = durationParseResult.tokens[0].value.toString('minutes');
                }

                this.setState({
                    duration: duration,
                    durationInput: event.target.value,
                    durationFeedback: durationFeedback
                });
            }
            else if (event.target === this.refs.details.getDOMNode()) {
                this.setState({
                    details: event.target.value
                });
            }
        },
        handleSave: function () {
            var validationApology = 'Sorry, we don\'t have enough information yet.\n\n';
            if (!this.state.date) {
                host.notify(validationApology + 'When did you do this?', 'error');
                return;
            }

            // Get model state from form state
            var logEntry = doozy.extrude(doozy.logEntry(), Object.assign({
                // include action name if action id is not set
                actionName: !this.state.actionId ? this.refs.name.getDOMNode().value : null
            }, this.state));

            // Save the logentry
            logEntryStore.save(logEntry, function () {
                // Go to the actions interface
                host.go('/doozy/actions');
            });
        },
        handleModelUpdate: function (model) {

            // create a copy of the action for editing
            var state = {};
            Object.assign(state, model);

            var durationParse = babble.get('durations').translate(state.duration + ' min');
            var durationInput = null;
            if (durationParse.tokens.length !== 0) {
                durationInput = durationParse.tokens[0].value.toString();
            }

            // If actionId is set, we don't need the action name
            if (state.actionId && state.actionName) {
                state.actionName = null;
            }

            state.durationInput = durationInput;
            state.dateInput = Date.create(model.date).toLocaleDateString();
            state.dateFeedback = '';

            this.setState(state);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // Waiting on store
            if (this.props.id && this.state.isNew) {
                return <div>Loading...</div>;
            }

            var buttons = [{type: 'primary',
                            text: 'Save Changes',
                            handler: this.handleSave},
                           {type: 'default',
                            text: 'Cancel',
                            handler: this.handleCancel}
                           ];

            var buttonsDom = buttons.map(function (button, index) {
                return (
                  <button key={index} style={buttonStyle} type="button"
                    className={'btn btn-' + button.type}
                    onClick={button.handler}>{button.text}</button>
                );
            });

            var slot1, slot2, log;

            // Entry input
            log = (
                <div className="form-group">
                    <label htmlFor="logentry-details">Entry</label>
                    <textarea id="logentry-details" ref="details" type="text" className="form-control" onChange={this.handleChange} value={this.state.details} />
                </div>
            );

            // Layout order of Entry input and Action input
            if (this.props.action || this.props.actionName || (this.props.logEntry && this.props.logEntry.actionId)) {
                slot1 = this.renderActionInput();
                slot2 = log;
            }
            else {
                slot1 = log;
                slot2 = this.renderActionInput();
            }

            return (
                <div style={styles.main}>
                    <h2>{this.state.isNew ? 'New Activity Log' : 'Update Activity Log'}</h2>
                    <form role="form">
                        {slot1}
                        {slot2}
                        {this.renderTagsInput()}
                        <div className="form-group">
                            <label htmlFor="logentry-kind">Kind</label>
                            <select id="logentry-kind" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="performed">Performed</option>
                                <option value="skipped">Skipped</option>
                            </select>
                        </div>
                        <div style={forceHeightStyle} className="form-group">
                            <label htmlFor="logentry-date">When</label>
                            <input id="logentry-date" ref="performedat" type="text" className="form-control" onChange={this.handleChange} value={this.state.dateInput} />
                            <span style={feedbackStyle}>{this.state.dateFeedback}</span>
                        </div>
                        <div style={forceHeightStyle} className="form-group">
                            <label htmlFor="logentry-duration">Duration</label>
                            <input id="logentry-duration" ref="actualduration" type="text" className="form-control" onChange={this.handleChange} value={this.state.durationInput} />
                            <span style={feedbackStyle}>{this.state.durationFeedback}</span>
                        </div>
                    </form>
                    {buttonsDom}
                </div>
            );
        },
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

    var forceHeightStyle = {
        height: '59px'
    };

    var feedbackStyle = {
        position: 'relative',
        top: '-28px',
        left: '285px'
    };

    return ManageLogEntry;
}));
