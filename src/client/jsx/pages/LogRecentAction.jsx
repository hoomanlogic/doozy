/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
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
		root.LogRecentAction = factory(root.React);
	}
}(this, function (React, Modal) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                name: '',
                isNewAction: false,
                date: Date.create('today'),
                dateInput: 'today',
                dateFeedback: Date.create('today').toLocaleDateString(),
                duration: 0,
                durationInput: '',
                durationFeedback: '',
                details: '',
            };
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
            window.ui.goBack();
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
            var existingAction, 
                newAction, 
                names,
                validationApology;

            // call method to save the action
            names = this.refs.name.getDOMNode().value.split('|');

            validationApology = 'Sorry, we don\'t have enough information yet.\n\n';

            if (names.length === 1 && names[0] === '') {
                toastr.error(validationApology + 'What did you do?');
                return;
            }

            if (String(this.state.date.getTime()) === 'NaN') {
                toastr.error(validationApology + 'When did you do this?');
                return;
            }

            for (var i =0; i < names.length; i++) {

                existingAction = actionStore.getActionByName(names[i]);

                if (existingAction) {
                    logEntryStore.create({
                        actionId: existingAction.id,
                        date: this.state.date, 
                        duration: this.state.duration, 
                        entry: 'performed', 
                        details: this.state.details 
                    });
                } else {
                    var tags;
                    if (this.refs.tags) {
                        // get tags from control
                        var tags = [];
                        if (this.refs.tags.getDOMNode().value) {
                            tags = this.refs.tags.getDOMNode().value.split(',');
                        }
                    } else {
                        // get tags from UI filter
                        var tags = ui.tags || [];
                        tags = tags.slice(); //copy
                        tags.push(this.props.focusTag);
                    }

                    newAction = hlapp.action(names[i], tags);
                    newAction.created = this.state.date.toISOString();
                    actionStore.lognew(newAction, { performed: this.state.date, duration: this.state.duration, entry: 'performed', details: this.state.details });
                }
            }

            window.ui.goBack();
        },

        /*************************************************************
         * MISC
         *************************************************************/
        setOptionsAction: function (selectize) {
            // clear previously set options
            selectize.clearOptions();

            // get actions sorted by name
            var actions = actionStore.updates.value;
            actions = _.sortBy(actions, function(action){ 
                action.name;
            });
            // add tags that user has assigned to other actions
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
                selectize.addOption(hlapp.parseTag(tag));
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
                    }
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

            // set current value
            var tags = ui.tags || [];
            tags = tags.slice(); //copy
            tags.push(this.props.focusTag);
            selectize.setValue(tags);
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
                            text: 'Log', 
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
                return <button key={index} style={buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>
            })
            
            var forceHeightStyle = {
                height: '59px'  
            };
            var feedbackStyle = {
                position: 'relative',
                top: '-28px',
                left: '285px'
            };

            var tags;
            
            if (this.state.isNewAction) {
                tags = (
                    <div className="form-group">
                        <label htmlFor="action-tags">Tags</label>
                        <input id="action-tags" ref="tags" type="text" />
                    </div>  
                );
            }

            return (
                <div style={{padding: '5px'}}>
                    <h2>{'Log Recent Action'}</h2>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="f1">What did you do?</label>
                            <input id="f1" ref="name" type="text" />
                        </div>
                        {tags}
                        <div style={forceHeightStyle} className="form-group">
                            <label htmlFor="f2">When did you do this?</label>
                            <input id="f2" ref="performedat" type="text" className="form-control" onChange={this.handleChange} value={this.state.dateInput} />
                            <span style={feedbackStyle}>{this.state.dateFeedback}</span>
                        </div>
                        <div style={forceHeightStyle} className="form-group">
                            <label htmlFor="f3">How long did it take?</label>
                            <input id="f3" ref="actualduration" type="text" className="form-control" onChange={this.handleChange} value={this.state.durationInput} />
                            <span style={feedbackStyle}>{this.state.durationFeedback}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="f4">Anything else?</label>
                            <textarea id="f4" ref="details" type="text" className="form-control" onChange={this.handleChange} value={this.state.details} />
                        </div>
                    </form>
                    {buttonsDom}
                </div>
            );
        },
    });
}));