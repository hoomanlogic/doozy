(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('babble'),
        require('stores/action-store'),
        require('stores/logentry-store'),
        require('mixins/SubscriberMixin')
    );
}(function (React, _, doozy, babble, actionStore, logEntryStore, SubscriberMixin) {
    /* globals $ */
    var ManageLogEntry = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [SubscriberMixin(logEntryStore)],
        propTypes: {
            logEntryId: React.PropTypes.string
        },

        getInitialState: function () {
            var state = Object.assign(doozy.logEntry(), {
                isNewAction: false,
                dateInput: 'today',
                dateFeedback: Date.create('today').toLocaleDateString(),
                durationInput: '',
                durationFeedback: '',
            });

            if (this.props.action) { // Log Action
                state.actionName = this.props.action.name || '';
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
            actionStore.subscribe(this.handleActionStoreUpdate, {});
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
            if (this.state.actionName) {
                selectActions.setValue(this.state.actionName);
            }

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
        componentDidUpdate: function () {
            // If we're still loading, then abort
            if (!this.refs.name) {
                return;
            }

            this.setupActionsControl();
            this.setupTagsControl();
            // This must be done AFTER setupTagsControls because
            // action selectize onChange event uses the tags selectize
            var selectActions = $(this.refs.name.getDOMNode())[0].selectize;
            this.setOptionsAction(selectActions);
            if (this.state.actionName) {
                selectActions.setValue(this.state.actionName);
            }
        },
        componentWilUnmount: function () {
            actionStore.unsubscribe(this.handleActionStoreUpdate, {});
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancel: function () {
            window.location.href = '/doozy/actions';
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
            var actionName,
                existingAction,
                logEntry,
                newAction,
                names,
                tags;

            // var validationApology = 'Sorry, we don\'t have enough information yet.\n\n';

            if (String(this.state.date.getTime()) === 'NaN') {
                // ui.message(validationApology + 'When did you do this?', 'error');
                return;
            }

            // get tags from control
            tags = [];
            if (this.refs.tags.getDOMNode().value) {
                tags = this.refs.tags.getDOMNode().value.split(',');
            }

            // Get model state from form state
            logEntry = {
                id: this.state.id,
                isNew: this.state.isNew,
                date: this.state.date.toISOString(),
                duration: this.state.duration,
                entry: this.state.kind,
                details: this.state.details,
                tags: tags
            };

            // get action info
            names = this.refs.name.getDOMNode().value.split('|');
            if (names.length > 0 && names[0] !== '') {
                actionName = names[0];
                existingAction = actionStore.getActionByName(actionName);
                if (existingAction) {
                    logEntry.actionId = existingAction.id;
                }
                else {
                    newAction = doozy.action(actionName, tags);
                    newAction.created = this.state.date.toISOString();
                }
            }

            // update log entry
            if (!newAction) {
                if (logEntry.isNew) {
                    logEntryStore.create(logEntry);
                }
                else {
                    logEntryStore.update(logEntry);
                }
            }
            else {
                // Create action first
                actionStore.create(newAction, function (serverAction) {
                    logEntry.actionId = serverAction.id;
                    // Then Create logentry that references action
                    if (logEntry.isNew) {
                        logEntryStore.create(logEntry, function () {
                            console.log('success');
                        });
                    }
                    else {
                        logEntryStore.update(logEntry, function () {
                            console.log('success');
                        });
                    }
                });
            }

            window.location.href = '/doozy/actions';
        },
        handleStoreUpdate: function (model) {

            // create a copy of the action for editing
            var state = {};
            Object.assign(state, model);

            var durationParse = babble.get('durations').translate(state.duration + ' min');
            var durationInput = null;
            if (durationParse.tokens.length !== 0) {
                durationInput = durationParse.tokens[0].value.toString();
            }

            state.id = state.id;
            if (state.actionId && !state.actionName) {
                state.actionName = actionStore.get(state.actionId).name;
            }

            state.durationInput = durationInput;
            state.dateInput = Date.create(model.date).toLocaleDateString();
            state.dateFeedback = '';

            this.setState(state);
        },
        handleActionStoreUpdate: function () {
            this.setState({
                lastUpdate: new Date().toISOString()
            });
        },

        /*************************************************************
         * MISC
         *************************************************************/
        setOptionsAction: function (selectActions) {
            if (!actionStore.context({}) || !actionStore.context({}).value) {
                return;
            }

            // clear previously set options
            selectActions.clearOptions();

            // get actions sorted by name
            var actions = _.sortBy(actionStore.context({}).value, function (action) {
                return action.name;
            });

            // add actions to selection control
            actions.forEach( function (action) {
                selectActions.addOption({
                    value: action.name,
                    text: action.name
                });
            });
        },
        setOptionsTag: function (selectize) {
            if (!actionStore.context({}) || !actionStore.context({}).value) {
                return;
            }

            // clear previously set options
            selectize.clearOptions();

            // get distinct tags user has assigned to other actions
            var actions = actionStore.context({}).value;
            var distinctTags = [];
            actions.map(function (item) {
                distinctTags = _.union(distinctTags, item.tags);
            });
            // { kind: 'Tag', name: tag }
            // add tags that user has assigned to other actions
            distinctTags.forEach( function (tag) {
                selectize.addOption(doozy.parseTag(tag));
            });
        },
        setupActionsControl: function () {
            if (!this.refs.name) {
                return;
            }

            $(this.refs.name.getDOMNode()).selectize({
                delimiter: '|',
                persist: true,
                create: function (input) {
                    return {
                        value: input,
                        text: input
                    };
                },
                maxItems: 1,
                openOnFocus: false,
                onChange: function (value) {
                    var existingAction = actionStore.getActionByName(value);
                    if (!this.state.duration && existingAction !== undefined && existingAction !== null) {
                        // merge tags
                        var selectize = $(this.refs.tags.getDOMNode())[0].selectize;
                        var tags = [].concat(existingAction.tags);
                        if (this.refs.tags.getDOMNode().value) {
                            tags = tags.concat(this.refs.tags.getDOMNode().value.split(','));
                        }
                        selectize.setValue(tags);

                        // set default duration if it is not already set
                        var duration = new babble.Duration(existingAction.duration * 60000);
                        if (this.state.duration > 0 && this.state.duration !== duration.toMinutes()) {
                            this.setState({
                                duration: duration.toMinutes(),
                                durationInput: duration.toString(),
                                durationFeedback: duration.toString()
                            });
                        }
                    }
                }.bind(this)
            });
        },
        setupTagsControl: function () {
            if (!this.refs.tags) {
                return;
            }

            // initialize control for tags functionality
            $(this.refs.tags.getDOMNode()).selectize({
                delimiter: ',',
                persist: true,
                valueField: 'value',
                labelField: 'name',
                searchField: ['name', 'kind'],
                render: {
                    item: function (item, escape) {
                        return '<div class="item">' + escape(item.value) + '</div>';
                    },
                    option: function (item, escape) {
                        var label = item.name || item.kind;
                        var caption = item.kind ? item.kind : null;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                    }
                },
                create: function (input) {
                    var kind = 'Tag';
                    var name = input;
                    if (name.indexOf('!') === 0) {
                        kind = 'Focus'; // part of
                        name = name.substring(1);
                    }
                    else if (name.indexOf('@') === 0) {
                        kind = 'Place'; // where
                        name = name.substring(1);
                    }
                    else if (name.indexOf('>') === 0) {
                        kind = 'Goal'; // to what end
                        name = name.substring(1);
                    }
                    else if (name.indexOf('$') === 0) {
                        kind = 'Need'; // why
                        name = name.substring(1);
                    }
                    else if (name.indexOf('#') === 0) {
                        kind = 'Box'; // when
                        name = name.substring(1);
                    }
                    return {
                        value: input,
                        kind: kind,
                        name: name
                    };
                }
            });

            // populate existing tag options
            var selectize = $(this.refs.tags.getDOMNode())[0].selectize;
            this.setOptionsTag(selectize);

            if (typeof this.props.logEntry !== 'undefined') {
                selectize.setValue(this.props.logEntry.tags);
            }
            else if (typeof this.props.action === 'undefined' || this.state.isNewAction) {
                // set current value
                // var tags = ui.tags || [];
                // tags = tags.slice(); //copy
                // tags.push(this.props.focusTag);
                var tags = [];
                selectize.setValue(tags);
            }
            else {
                selectize.setValue(this.props.action.tags);
            }
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            // Waiting on store
            if (this.props.logEntryId && this.state.isNew) {
                return <div>Loading...</div>;
            }

            var buttons = [{type: 'primary',
                            text: this.state.id ? 'Update Log' : 'Log',
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

            var slot1, slot2, action, log;

            log = (
                <div className="form-group">
                    <label htmlFor="logentry-details">Entry</label>
                    <textarea id="logentry-details" ref="details" type="text" className="form-control" onChange={this.handleChange} value={this.state.details} />
                </div>
            );
            action = (
                <div className="form-group">
                    <label htmlFor="f1">Action</label>
                    <input id="f1" ref="name" type="text" />
                </div>
            );

            if (this.props.action || this.props.actionName || (this.props.logEntry && this.props.logEntry.actionId)) {
                slot1 = action;
                slot2 = log;
            }
            else {
                slot1 = log;
                slot2 = action;
            }

            return (
                <div style={styles.main}>
                    <h2>{this.state.id ? 'Update Log' : 'Log Recent Action'}</h2>
                    <form role="form">
                        {slot1}
                        {slot2}
                        <div className="form-group">
                            <label htmlFor="action-tags">Tags</label>
                            <input id="action-tags" ref="tags" type="text" />
                        </div>
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
