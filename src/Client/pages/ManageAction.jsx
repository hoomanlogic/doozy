// CommonJS, AMD, and Global shim
(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('app/doozy'),
        require('stores/ActionStore'),
        require('stores/LogEntryStore'),
        require('babble')
    );
}(function (React, doozy, actionStore, logEntryStore, babble) {
    var ManageAction = React.createClass({

        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        VIEW_MODE: {
            GENERAL: 'general',
            HISTORY: 'history'
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                viewMode: 'general',
                durationInput: null,
                durationDisplay: null,
                dateInput: null,
                dateDisplay: null,
                ordinal: null,
                repeat: 'o',
                repeatInterval: 1,
                repeatSun: false,
                repeatMon: false,
                repeatTue: false,
                repeatWed: false,
                repeatThu: false,
                repeatFri: false,
                repeatSat: false,
                logEntriesLastUpdated: new Date().toISOString()
            };
        },

        componentWillReceiveProps: function (nextProps) {
            if (!nextProps.action) {
                // get tags from UI filter
                var tags = ui.tags || [];
                tags = tags.slice(); //copy
                tags.push(this.props.focusTag);

                // create a new action
                nextProps.action = doozy.action('New ToDo', tags);
                nextProps.action.name = null;
                nextProps.action.created = new Date().toISOString();
            } else if (nextProps.action.id !== this.props.action.id) {
                nextProps.action = this.edit(nextProps.action);
            }
        },

        componentWillMount: function () {

            if (!this.props.action) {
                // get tags from UI filter
                var tags = ui.tags || [];
                tags = tags.slice(); //copy
                tags.push(this.props.focusTag);

                // create a new action
                this.props.action = doozy.action('New ToDo', tags);
                this.props.action.name = null;
                this.props.action.created = new Date().toISOString();
            } else {
                this.props.action = this.edit(this.props.action);
            }

            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
        },

        componentDidMount: function () {
            this.setupTagsControl();

            var resizeTextArea = function () {
                if (Math.abs($(this).height() - this.scrollHeight) > 16) {
                    $(this).height(0).height(this.scrollHeight);
                }
            };

            $(this.refs.content.getDOMNode()).on( 'change keyup keydown paste cut', resizeTextArea).change();

            if (this.props.mode === 'Add') {
                $(this.refs.name.getDOMNode()).focus();
            }
        },

        /*************************************************************
         * API
         *************************************************************/
        edit: function (action) {
            // create a copy of the action for editing
            var editableCopy = {};
            Object.assign(editableCopy, action);

            // flag to call modal's graceful open dialog function
            this.show = true;

            var id = editableCopy.id
            if (!actionStore.getActionById(id)) {
                id = null;
            }
            var name = editableCopy.name;
            var content = editableCopy.content;

            var durationParse = babble.get('durations').translate(editableCopy.duration + ' min');
            if (durationParse.tokens.length === 0) {
                var durationInput = null;
            } else {
                var durationInput = durationParse.tokens[0].value.toString();
            }

            if (action.nextDate === null || String(action.nextDate) === 'NaN') {
                var date = null;
            } else {
                var date = (new Date(action.nextDate)).toLocaleDateString();
            }

            // build state
            var state = {
                id: id,
                name: name,
                content: content,
                durationInput: durationInput,
                durationDisplay: null,
                dateInput: date,
                dateDisplay: null,
                ordinal: editableCopy.ordinal,
                mode: 'Edit',
                repeat: 'o',
                repeatInterval: 1,
                repeatSun: false,
                repeatMon: false,
                repeatTue: false,
                repeatWed: false,
                repeatThu: false,
                repeatFri: false,
                repeatSat: false
            };

            if (action.recurrenceRules.length > 0) {
                var recurrenceObj = doozy.parseRecurrenceRule(action.recurrenceRules[0]);
                state.repeat = recurrenceObj.freq.slice(0,1).toLowerCase();
                state.repeatInterval = recurrenceObj.interval;
                if (recurrenceObj.byday) {
                    for (var i = 0; i < recurrenceObj.byday.length; i++) {
                        if (recurrenceObj.byday[i].day === 'SU') {
                            state.repeatSun = true;
                        }
                        if (recurrenceObj.byday[i].day === 'MO') {
                            state.repeatMon = true;
                        }
                        if (recurrenceObj.byday[i].day === 'TU') {
                            state.repeatTue = true;
                        }
                        if (recurrenceObj.byday[i].day === 'WE') {
                            state.repeatWed = true;
                        }
                        if (recurrenceObj.byday[i].day === 'TH') {
                            state.repeatThu = true;
                        }
                        if (recurrenceObj.byday[i].day === 'FR') {
                            state.repeatFri = true;
                        }
                        if (recurrenceObj.byday[i].day === 'SA') {
                            state.repeatSat = true;
                        }
                    }
                }
            }

            // set state
            this.setState(state);

            return editableCopy;
        },

        /*************************************************************
         * BINDINGS
         *************************************************************/
        setOptions: function (selectize) {
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
        setupTagsControl: function () {
            if (this.props.action) {
                // initialize control for tags functionality
                $(this.refs.tags.getDOMNode()).selectize({
                    delimiter: ',',
                    persist: true,
                    valueField: 'value',
                    labelField: 'name',
                    searchField: ['name', 'kind'],
                    render: {
                        item: function(item, escape) {
                            return '<div class="item"><i class="fa ' + item.className + '"></i> ' + escape(item.name) + '</div>';
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
                        return doozy.parseTag(input);
                    }
                });

                // populate existing tag options
                var selectize = $(this.refs.tags.getDOMNode())[0].selectize;
                this.setOptions(selectize);

                // set current value
                if (this.props.action) {
                    selectize.setValue(this.props.action.tags);
                }
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleLogEntryStoreUpdate: function (logEntries) {
            if (this.state.viewMode === this.VIEW_MODE.HISTORY) {
                this.setState({logEntriesLastUpdated: new Date().toISOString()});
            }
        },

        handleChange: function (event) {
            if (event.target === this.refs.name.getDOMNode()) {
                var actionName = event.target.value;
                this.state.name = event.target.value;
            } else if (event.target === this.refs.content.getDOMNode()) {
                this.state.content = event.target.value;
            } else if (event.target === this.refs.duration.getDOMNode()) {
                var durationParsed = babble.get('durations').translate(this.refs.duration.getDOMNode().value.trim());
                var duration = 0;
                var durationDisplay = '';
                if (durationParsed.tokens.length > 0) {
                    duration = durationParsed.tokens[0].value.toMinutes();
                    durationDisplay = durationParsed.tokens[0].value.toString('minutes');
                }

                this.props.action.duration = duration;
                this.state.durationInput = this.refs.duration.getDOMNode().value;
                this.state.durationDisplay = durationDisplay;
            } else if (event.target === this.refs.repeat.getDOMNode()) {
                this.state.repeat = event.target.value;
            } else if (event.target === this.refs.nextdate.getDOMNode()) {

                var dateValue = Date.create(event.target.value);
                var dateDisplay = '';
                try {
                    dateDisplay = dateValue.toISOString();
                } catch (e) {
                    if (e instanceof RangeError) {
                        dateValue = null;
                    } else {
                        throw e;
                    }
                }

                if (dateValue !== null) {
                    if (dateValue.getHours() === 0 && dateValue.getMinutes() === 0) {
                        dateDisplay = dateValue.toLocaleDateString();
                    } else {
                        dateDisplay = dateValue.toLocaleDateString() + ' ' + dateValue.toLocaleTimeString();
                    }
                }

                this.props.action.nextdate = dateValue;
                this.setState({dateInput: event.target.value, dateDisplay: dateDisplay});

                this.props.action.nextDate = event.target.value;
            } else if (this.refs.repeatInterval && event.target === this.refs.repeatInterval.getDOMNode()) {
                this.state.repeatInterval = parseInt(event.target.value);
            } else if (this.refs.repeatSun && event.target === this.refs.repeatSun.getDOMNode()) {
                this.state.repeatSun = event.target.checked;
            } else if (this.refs.repeatMon && event.target === this.refs.repeatMon.getDOMNode()) {
                this.state.repeatMon = event.target.checked;
            } else if (this.refs.repeatTue && event.target === this.refs.repeatTue.getDOMNode()) {
                this.state.repeatTue = event.target.checked;
            } else if (this.refs.repeatWed && event.target === this.refs.repeatWed.getDOMNode()) {
                this.state.repeatWed = event.target.checked;
            } else if (this.refs.repeatThu && event.target === this.refs.repeatThu.getDOMNode()) {
                this.state.repeatThu = event.target.checked;
            } else if (this.refs.repeatFri && event.target === this.refs.repeatFri.getDOMNode()) {
                this.state.repeatFri = event.target.checked;
            } else if (this.refs.repeatSat && event.target === this.refs.repeatSat.getDOMNode()) {
                this.state.repeatSat = event.target.checked;
            } else if (event.target === this.refs.ispublic.getDOMNode()) {
                this.props.action.isPublic = event.target.checked;
            } else if (event.target === this.refs.ordinal.getDOMNode()) {
                var ord = null;
                try {
                    ord = parseInt(event.target.value);
                } catch (e) {

                }
                this.setState({ordinal: ord});
            }
            this.setState({
                name: this.state.name,
                content: this.state.content,
                durationInput: this.state.durationInput,
                durationDisplay: this.state.durationDisplay,
                ordinal: ord,
                repeat: this.state.repeat,
                repeatInterval: this.state.repeatInterval,
                repeatSun: this.state.repeatSun,
                repeatMon: this.state.repeatMon,
                repeatTue: this.state.repeatTue,
                repeatWed: this.state.repeatWed,
                repeatThu: this.state.repeatThu,
                repeatFri: this.state.repeatFri,
                repeatSat: this.state.repeatSat
            });
        },
        handleCancelClick: function(event) {
            ui.goBack();
        },
        handleDeleteClick: function() {
            actionStore.destroy(this.props.action);
            ui.goBack();
        },
        handleToggleViewModeClick: function(event) {
            if (this.state.viewMode === 'general') {
                this.setState({ viewMode: 'history' });
            } else {
                this.setState({ viewMode: 'general' });
            }
        },
        handleSaveClick: function(event) {

            var action;
            if (this.state.id) {
                action = actionStore.getActionById(this.state.id);
            }
            if (!action) {
                action = doozy.action(this.state.name);
            }
            else {
                action = Object.assign({}, action);
                action.name = this.state.name;
            }

            // set state of tags
            var tags = [];
            if (this.refs.tags.getDOMNode().value) {
                tags = this.refs.tags.getDOMNode().value.split(',');
            }
            action.tags = tags;



            // build recurrence rules
            var recurrenceRules = [];
            if (this.state.repeat === 'd') {
                var dailyRule = 'RRULE:FREQ=DAILY';
                if (this.state.repeatInterval > 1) {
                    dailyRule += ';INTERVAL=' + this.state.repeatInterval;
                }
                recurrenceRules.push(dailyRule);
            } else if (this.state.repeat === 'w' && (
            this.state.repeatSun ||
            this.state.repeatMon ||
            this.state.repeatTue ||
            this.state.repeatWed ||
            this.state.repeatThu ||
            this.state.repeatFri ||
            this.state.repeatSat)) {

                var weeklyRule = 'RRULE:FREQ=WEEKLY;BYDAY=';
                var days = [];
                if (this.state.repeatSun) {
                    days.push('SU');
                }
                if (this.state.repeatMon) {
                    days.push('MO');
                }
                if (this.state.repeatTue) {
                    days.push('TU');
                }
                if (this.state.repeatWed) {
                    days.push('WE');
                }
                if (this.state.repeatThu) {
                    days.push('TH');
                }
                if (this.state.repeatFri) {
                    days.push('FR');
                }
                if (this.state.repeatSat) {
                    days.push('SA');
                }
                weeklyRule += days.join(',');

                if (this.state.repeatInterval > 1) {
                    weeklyRule += ';INTERVAL=' + this.state.repeatInterval;
                }
                recurrenceRules.push(weeklyRule);
            } else if (this.state.repeat === 'm') {
                var monthlyRule = 'RRULE:FREQ=MONTHLY';
                if (this.state.repeatInterval > 1) {
                    monthlyRule += ';INTERVAL=' + this.state.repeatInterval;
                }
                recurrenceRules.push(monthlyRule);
            } else if (this.state.repeat === 'y') {
                var yearlyRule = 'RRULE:FREQ=YEARLY';
                if (this.state.repeatInterval > 1) {
                    yearlyRule += ';INTERVAL=' + this.state.repeatInterval;
                }
                recurrenceRules.push(yearlyRule);
            }
            action.recurrenceRules = recurrenceRules;
            action.ordinal = this.state.ordinal;

            // build next date
            if (action.nextDate !== null) {
                action.nextDate = babble.moments.parseLocalDate(action.nextDate).toISOString();
            }

            // call method to save the action
            if (this.props.mode === 'Edit') {
                actionStore.update(action);
            } else {
                actionStore.create(action);
            }

            ui.goBack();
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        renderDayCheckbox: function (day) {
            var checkboxStyle = { display: 'inline-block', width: '34px' };
            var divStyle = { display: 'inline' };
            var labelStyle = {fontSize: '1.4rem', verticalAlign: 'super'};
            return (
                <div style={divStyle}>
                    <label style={labelStyle} htmlFor={'action-repeat-' + day.toLowerCase()}>{day.slice(0,1)}</label>
                    <input
                        id={'action-repeat-' + day.toLowerCase()}
                        ref={'repeat' + day}
                        type="checkbox"
                        className="form-control"
                        style={checkboxStyle}
                        checked={this.state['repeat' + day]}
                        onChange={this.handleChange} />
                </div>
            );
        },
        renderRepeatOptions: function () {
            var repeat = this.state.repeat;

            if (repeat === 'w') {

                /**
                 * Render day of week checkboxes in order
                 * based on the user's start of week
                 */
                var dayIndex = userStore.updates.value.weekStarts;
                var daysOfWeek = [];
                while (daysOfWeek.length < 7) {
                    daysOfWeek.push(this.renderDayCheckbox(babble.moments.daysOfWeek[dayIndex].slice(0,3)));
                    dayIndex++;
                    if (dayIndex > 6) {
                        dayIndex = 0;
                    }
                }

                return ([
                    <div className="form-group">
                        <label htmlFor="action-repeat-interval">Every</label>
                        <input id="action-repeat-interval" ref="repeatInterval" type="number" className="form-control" value={this.state.repeatInterval} onChange={this.handleChange} />
                        <label>Week(s)</label>
                    </div>,
                    <div className="form-group">
                        {daysOfWeek}
                    </div>
                ]);
            } else if (repeat === 'd' || repeat === 'm' || repeat === 'y') {
                return (
                    <div className="form-group">
                        <label htmlFor="action-repeat-interval">Every</label>
                        <input id="action-repeat-interval" ref="repeatInterval" type="number" className="form-control" value={this.state.repeatInterval} onChange={this.handleChange} />
                        <label>{doozy.getFrequencyName(this.state.repeat) + '(s)'}</label>
                    </div>
                );
            } else {
                return null;
            }
        },
        renderGeneralView: function () {

            /**
             * State and Prop Dependencies
             */
            var action = this.props.action;
            var isPublic = action.isPublic;
            var name = action.name || '';
            var content = action.content || '';
            var durationInput = this.state.durationInput;
            var dateInput = this.state.dateInput;

            /**
             * Sub Renders
             */
            var repeatOptions = this.renderRepeatOptions();

            /**
             * Render
             */
            return (
                <form role="form">
                    <div className="form-group">
                        <label htmlFor="action-name">Name</label>
                        <input id="action-name" ref="name" type="text" className="form-control" placeholder="Name of action" value={this.state.name} onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="action-tags">Tags</label>
                        <input id="action-tags" ref="tags" type="text" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="action-duration">How long do you think it will take?</label>
                        <input id="action-duration" ref="duration" type="text" className="form-control" value={durationInput} onChange={this.handleChange} />
                        <span>{this.state.durationDisplay}</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="action-repeat">How often will you do this?</label>
                        <select id="action-repeat" ref="repeat" className="form-control" value={this.state.repeat} onChange={this.handleChange}>
                            <option value="o">Once</option>
                            <option value="d">Daily</option>
                            <option value="w">Weekly</option>
                            <option value="m">Monthly</option>
                            <option value="y">Yearly</option>
                        </select>
                    </div>
                    {repeatOptions}
                    <div className="form-group">
                        <label htmlFor="action-content">Please add details here</label>
                        <textarea id="action-content" ref="content" type="text" className="form-control" value={this.state.content} onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="action-nextdate">Hold off on this until</label>
                        <input id="action-nextdate" ref="nextdate" type="datetime" className="form-control" value={dateInput} onChange={this.handleChange} />
                        <span>{this.state.dateDisplay}</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="action-ordinal">What ordinal?</label>
                        <input id="action-ordinal" ref="ordinal" type="number" className="form-control" value={this.state.ordinal} onChange={this.handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="action-ispublic">Allow others to see this action?</label>
                        <input id="action-ispublic" ref="ispublic" type="checkbox" className="form-control" checked={isPublic} onChange={this.handleChange} />
                    </div>
                </form>
            );
        },
        renderHistoryView: function () {
            var actionId = this.props.action.id;
            var logEntries = logEntryStore.updates.value.filter(function (item) {
                return item.actionId === actionId;
            });

            logEntries = _.sortBy(logEntries, function(item) { return item.date.split('T')[0] + '-' + (['performed','skipped'].indexOf(item.entry) > -1 ? '1' : '0'); });
            logEntries.reverse();

            return (
                <div>
                    <h2 style={{ margin: '0 0 5px 5px'}}>Action History Log</h2>
                    <div className={this.props.hidden ? 'hidden' : ''} style={{backgroundColor: '#444', padding: '5px', marginLeft: '-5px', marginRight: '-5px'}}>
                        {logEntries.map(
                            function(item) {
                                return (<LogEntryBox data={item} />);
                            }.bind(this)
                        )}
                    </div>
                </div>
            );
        },
        render: function () {

            /**
             * Render view based on the current view mode
             */
            var currentView = null,
                toggleTitle = null;
            if (this.state.viewMode === this.VIEW_MODE.GENERAL) {
                currentView = this.renderGeneralView();
                toggleTitle = 'View Action Log';
            } else if (this.state.viewMode === this.VIEW_MODE.HISTORY) {
                currentView = this.renderHistoryView();
                toggleTitle = 'View General';
            }

            /**
             * Buttons array to pass to Modal component
             */
            var buttons;
            var buttonStyle = {
                display: 'block',
                width: '100%',
                marginBottom: '5px',
                fontSize: '1.1rem'
            };

            var deleteButtonStyle = Object.assign({}, buttonStyle, {
                marginTop: '3rem'
            });

            if (this.props.mode === 'Add') {
                buttons = [{type: 'primary',
                            text: 'Save Action',
                            handler: this.handleSaveClick,
                            buttonStyle: buttonStyle},
                           {type: 'default',
                            text: 'Cancel',
                            handler: this.handleCancelClick,
                            buttonStyle: buttonStyle},
                           ];
            }
            else {
                buttons = [{type: 'default',
                            text: toggleTitle,
                            handler: this.handleToggleViewModeClick,
                            buttonStyle: buttonStyle},
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
            }

            var buttonsDom = buttons.map(function(button, index) {
                return (<button key={index} style={button.buttonStyle} type="button" className={'btn btn-' + button.type} onClick={button.handler}>{button.text}</button>);
            });

            /**
             * Render
             */
            return (
                <div style={{padding: '5px'}}>
                    <h2 style={{marginTop: '0.2rem', marginBottom: '0.2rem'}}>{this.props.mode === 'Edit' ? this.props.action.name : 'New Action'}</h2>
                    {currentView}
                    {buttonsDom}
                </div>
            );
        },
    });
    return ManageAction;
}));
