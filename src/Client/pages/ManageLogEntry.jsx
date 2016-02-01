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

            if (this.props.actionId) {
                // Log Action
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
            /**
             * Setup Action and Tags selector
             */
            this.setupActionInput();
            this.setupTagsInput();
            
            // Attach listener to 
            var textArea = this.refs.details.getDOMNode();
            textArea.addEventListener('input', autoGrow.bind(null, textArea));
            autoGrow(textArea);

            /**
             * Set focus to control
             */
            $(this.refs.performedat.getDOMNode()).focus();
        },
        componentDidUpdate: function () {
            // Attach listener to 
            var textArea = this.refs.details.getDOMNode();
            autoGrow(textArea);  
        },
        componentWillUnmount: function () {
            // Attach listener to 
            var textArea = this.refs.details.getDOMNode();
            textArea.removeEventListener('input', autoGrow.bind(null, textArea));
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancelClick: function () {
            host.go('/doozy/actions');
        },
        handleDeleteClick: function () {
            host.prompt('Are you sure you want to delete this log entry?\n\nIf so, type DELETE and hit enter', function (response) {
                if ((response || '').toLowerCase() === 'delete') {
                    logEntryStore.destroy(this.props.id, function () {
                        host.go('/doozy/actions');    
                    });
                }
            }.bind(this));
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
        handleSaveClick: function () {
            var validationApology = 'Sorry, we don\'t have enough information yet.\n\n';
            if (!this.state.date) {
                host.notify(validationApology + 'When did you do this?', 'error');
                return;
            }

            // Get model state from form state
            var logEntry = doozy.extrude(doozy.logEntry(), Object.assign({
                // include action name if action id is not set
                actionName: !this.state.actionId ? this.refs.action.getDOMNode().value : null
            }, this.state));

            // Save the logentry
            logEntryStore.save(logEntry, function () {
                // Go to the actions interface
                host.go('/doozy/actions');
            });
        },
        handleModelUpdate: function (model) {
            if (!model) {
                this.setState(this.getInitialState());    
                return;
            }
            
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
        handleStoresMixinUpdate: function (storeName) {
            /**
             * Setup Action and Tags selector
             */
            if (storeName === 'Action') {
                this.setupActionInput();
            }
            else if (storeName === 'Tag') {
                this.setupTagsInput();    
            }
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <div style={styles.main}>
                    <h2>{this.state.isNew ? 'New Activity Log' : 'Update Activity Log'}</h2>
                    <form role="form">
                        <div style={forceHeightStyle} className="form-group">
                            <label htmlFor="logentry-date">When</label>
                            <input id="logentry-date" ref="performedat" type="text" className="form-control" onChange={this.handleChange} value={this.state.dateInput} />
                            <span style={feedbackStyle}>{this.state.dateFeedback}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="logentry-details">Entry</label>
                            <textarea id="logentry-details" ref="details" type="text" className="form-control" onChange={this.handleChange} value={this.state.details} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tags">Tags</label>
                            <input id="tags" ref="tags" type="text" />
                        </div>
                        <div style={forceHeightStyle} className="form-group">
                            <label htmlFor="logentry-duration">Duration</label>
                            <input id="logentry-duration" ref="actualduration" type="text" className="form-control" onChange={this.handleChange} value={this.state.durationInput} />
                            <span style={feedbackStyle}>{this.state.durationFeedback}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="action">Action</label>
                            <input id="action" ref="action" type="text" />
                            <span>{(this.state.actionTags || []).join(',')}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="logentry-kind">Kind</label>
                            <select id="logentry-kind" ref="kind" className="form-control" value={this.state.kind} onChange={this.handleChange}>
                                <option value="performed">Performed</option>
                                <option value="skipped">Skipped</option>
                            </select>
                        </div>
                    </form>
                    {this.renderButtons()}
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

    var forceHeightStyle = {
        height: '59px'
    };

    var feedbackStyle = {
        position: 'relative',
        top: '-28px',
        left: '285px'
    };
    
    function autoGrow (textArea) {
        textArea.style.overflowY = 'hidden';
        textArea.style.height = 'auto';
        textArea.style.height = textArea.scrollHeight + 'px';
    }

    return ManageLogEntry;
}));
