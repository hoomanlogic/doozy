// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('react')
        );
    }
    else if (typeof define === "function" && define.amd) {
        // AMD
        define([
            'react'
        ], factory);
    }
    else {
        // Global (browser)
        window.ManageLogEntry = factory(window.React);
    }
}(function (React, Modal) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {

            var state = {
                id: '',
                name: '',
                isNewAction: false,
                date: Date.create('today'),
                dateInput: 'today',
                dateFeedback: Date.create('today').toLocaleDateString(),
                duration: 0,
                durationInput: durationInput,
                durationFeedback: '',
                details: '',
                kind: 'performed'
            };

            if (this.props.logEntry) {

                // create a copy of the action for editing
                var editableCopy = {};
                Object.assign(editableCopy, this.props.logEntry);

                var durationParse = babble.get('durations').translate(editableCopy.duration + ' min');
                var durationInput = null;
                if (durationParse.tokens.length !== 0) {
                    var durationInput = durationParse.tokens[0].value.toString();
                }

                state.id = editableCopy.id;
                if (editableCopy.actionId) {

                }

                state.details = editableCopy.details;
                state.duration = editableCopy.duration;
                state.durationInput = durationInput;
                state.date = Date.create(editableCopy.date);
                state.dateInput = state.date.toLocaleDateString();
                state.dateFeedback = '';
            }

            return state;
        },

        componentWillMount: function () {
            if (this.props.action) {
                this.log(this.props.action);
            }

        },

        componentDidMount: function () {
            /**
             * Setup Action selector
             */
            this.setupActionsControl();
            var selectize = $(this.refs.name.getDOMNode())[0].selectize;
            this.setOptionsAction(selectize);

            /**
             * Setup Tag selector
             */
            this.setupTagsControl();

            /**
             * Set Action Value
             */
            if (this.props.action && this.props.action.name) {
                if (this.state.isNewAction && this.props.action.name.length > 0) {
                    selectize.addOption({
                        value: this.props.action.name,
                        text: this.props.action.name
                    });
                }
                selectize.setValue(this.props.action.name);
            }

            /**
             * Set focus to control
             */
            if (this.props.action && this.props.action.name && this.props.action.name.length > 0) {
                $(this.refs.actualduration.getDOMNode()).focus();
            } else {
                $(this.refs.name.getDOMNode())[0].selectize.focus();
            }
        },

        componentDidUpdate: function () {
            if (this.state.isNewAction) {
                this.setupTagsControl();
            }
        },
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCancel: function(event) {
            window.ui.goTo('Do');
        },
        handleChange: function(event) {
            if (event.target === this.refs.performedat.getDOMNode()) {

                var date = Date.create(event.target.value.trim());
                var dateFeedback = date.toLocaleDateString();

                var isValid = true;

                try {
                    date.toISOString();
                } catch (e) {
                    if (e instanceof RangeError) {
                        isValid = false;
                    } else {
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
            } else if (event.target === this.refs.kind.getDOMNode()) {
                this.setState({
                    kind: event.target.value
                });
            } else if (event.target === this.refs.actualduration.getDOMNode()) {
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
            } else if (event.target === this.refs.details.getDOMNode()) {
                this.setState({
                    details: event.target.value
                });
            }
        },
        handleSave: function(event) {
            var actionName,
                existingAction,
                logEntry,
                newAction,
                names,
                tags,
                validationApology;

            // call method to save the action
            names = this.refs.name.getDOMNode().value.split('|');

            validationApology = 'Sorry, we don\'t have enough information yet.\n\n';

            //if (names.length === 1 && names[0] === '') {
            //    toastr.error(validationApology + 'What did you do?');
            //    return;
            //}

            if (String(this.state.date.getTime()) === 'NaN') {
                toastr.error(validationApology + 'When did you do this?');
                return;
            }

            // get tags from control
            tags = [];
            if (this.refs.tags.getDOMNode().value) {
                tags = this.refs.tags.getDOMNode().value.split(',');
            }

            logEntry = {
                date: this.state.date.toISOString(),
                duration: this.state.duration,
                entry: this.state.kind,
                details: this.state.details,
                tags: tags
            };

            // get action info
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
            if (this.props.logEntry) {
                logEntry.id = this.state.id;
                if (!newAction) {
                    logEntryStore.update(logEntry);
                } else {
                    logEntryStore.updateWithNewAction(newAction, logEntry);
                }
            }
            else {
                if (!newAction) {
                    logEntryStore.create(logEntry);
                } else {
                    logEntryStore.createWithNewAction(newAction, logEntry);
                }
            }

            window.ui.goTo('Do');
        },

        /*************************************************************
         * MISC
         *************************************************************/
        setOptionsAction: function (selectize) {
            // clear previously set options
            selectize.clearOptions();

            // get actions sorted by name
            var actions = actionStore.updates.value;
            actions = _.sortBy(actions, function(action) {
                action.name;
            });
            // add actions to selection control
            actions.forEach( function (action) {
                selectize.addOption({
                    value: action.name,
                    text: action.name
                });
            });
        },
        setOptionsTag: function (selectize) {
            // clear previously set options
            selectize.clearOptions();

            // get distinct tags user has assigned to other actions
            var actions = actionStore.updates.value;
            var distinctTags = [];
            actions.map(function(item) {
                distinctTags = _.union(distinctTags, item.tags);
            });
            // { kind: 'Tag', name: tag }
            // add tags that user has assigned to other actions
            distinctTags.forEach( function (tag) {
                selectize.addOption(doozy.parseTag(tag));
            });
        },
        setupActionsControl: function () {
            $(this.refs.name.getDOMNode()).selectize({
                delimiter: '|',
                persist: true,
                create: function(input) {
                    return {
                        value: input,
                        text: input
                    };
                },
                maxItems: 1,
                openOnFocus: false,
                onItemAdd: function (value, $item) {
                    var existingAction = actionStore.getActionByName(value);
                    if (existingAction !== void 0 && existingAction !== null) {
                        var duration = new babble.Duration(existingAction.duration * 60000);
                        this.setState({
                            isNewAction: false,
                            duration: duration.toMinutes(),
                            durationInput: duration.toString(),
                            durationFeedback: duration.toString()
                        });
                    }
                    else {
                        this.setState({
                            isNewAction: true
                        });
                    }
                }.bind(this),
                onChange: function (value) {
                    var existingAction = actionStore.getActionByName(value);
                    if (existingAction !== void 0 && existingAction !== null) {
                        var selectize = $(this.refs.tags.getDOMNode())[0].selectize;
                        selectize.setValue(existingAction.tags);
                    }
                }.bind(this)
            });
        },
        setupTagsControl: function () {

            // initialize control for tags functionality
            $(this.refs.tags.getDOMNode()).selectize({
                delimiter: ',',
                persist: true,
                valueField: 'value',
                labelField: 'name',
                searchField: ['name', 'kind'],
                render: {
                    item: function(item, escape) {
                        return '<div class="item">' + escape(item.value) + '</div>';
                    },
                    option: function(item, escape) {
                        var label = item.name || item.kind;
                        var caption = item.kind ? item.kind : null;
                        return '<div>' +
                            '<span class="label">' + escape(label) + '</span>' +
                            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
                        '</div>';
                    }
                },
                create: function(input) {
                    var kind = 'Tag';
                    var name = input;
                    if (name.indexOf('!') === 0) {
                        kind = 'Focus'; // part of
                        name = name.substring(1);
                    } else if (name.indexOf('@') === 0) {
                        kind = 'Place'; // where
                        name = name.substring(1);
                    } else if (name.indexOf('>') === 0) {
                        kind = 'Goal'; // to what end
                        name = name.substring(1);
                    } else if (name.indexOf('$') === 0) {
                        kind = 'Need'; // why
                        name = name.substring(1);
                    } else if (name.indexOf('#') === 0) {
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
                var tags = ui.tags || [];
                tags = tags.slice(); //copy
                tags.push(this.props.focusTag);
                selectize.setValue(tags);
            } else {
                selectize.setValue(this.props.action.tags);
            }
        },

        /*************************************************************
         * API
         *************************************************************/
        log: function (action) {

            var actionName = '';

            var state = {
                date: Date.create('today'),
                dateInput: 'today',
                dateFeedback: Date.create('today').toLocaleDateString(),
                duration: 0,
                durationInput: '',
                durationFeedback: '',
                details: '',
            };

            if (typeof action === 'object' && action.hasOwnProperty('duration') && action.duration) {
                var duration = new babble.Duration(action.duration * 60 * 1000);
                Object.assign(state, {
                    duration: duration.toMinutes(),
                    durationInput: duration.toString(),
                    durationFeedback: duration.toString()
                });
            }

            if (action.hasOwnProperty('name')) {
                actionName = action.name || '';
            } else if (typeof action === 'string') {
                actionName = action || '';
            }

            if (!actionStore.getActionByName(actionName)) {
                state.isNewAction = true;
            }

            this.setState(state);
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var buttons = [{type: 'primary',
                            text: this.state.id ? 'Update Log' : 'Log',
                            handler: this.handleSave},
                           {type: 'default',
                            text: 'Cancel',
                            handler: this.handleCancel}
                           ];
            var buttonStyle = {
              display: 'block',
              width: '100%',
              marginBottom: '5px',
              fontSize: '1.1rem'
            };

            var buttonsDom = buttons.map(function(button, index) {
                return (
                  <button key={index} style={buttonStyle} type="button"
                    className={'btn btn-' + button.type}
                    onClick={button.handler}>{button.text}</button>
                );
            });

            var forceHeightStyle = {
                height: '59px'
            };
            var feedbackStyle = {
                position: 'relative',
                top: '-28px',
                left: '285px'
            };

            var tags;

            return (
                <div style={{padding: '5px'}}>
                    <h2>{this.state.id ? 'Update Log' : 'Log Recent Action'}</h2>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="logentry-details">Entry</label>
                            <textarea id="logentry-details" ref="details" type="text" className="form-control" onChange={this.handleChange} value={this.state.details} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="f1">Action</label>
                            <input id="f1" ref="name" type="text" />
                        </div>
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
}));
