// CommonJS, AMD, and Global shim
(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('app/doozy'),
        require('stores/host'),
        require('stores/action-store'),
        require('stores/tag-store'),
        require('mixins/ModelMixin'),
        require('mixins/StoresMixin'),
        require('mixins/SelectTagsMixin'),
        require('babble')
    );
}(function (React, _, doozy, host, actionStore, tagStore, ModelMixin, StoresMixin, SelectTagsMixin, babble) {
    /* global $ */
    var ManageAction = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [ModelMixin(actionStore), StoresMixin([tagStore]), SelectTagsMixin],
        propTypes: {
            id: React.PropTypes.string,
        },
        statics: {
            VIEW_MODE: {
                GENERAL: 'general',
                HISTORY: 'history'
            },
        },
        getInitialState: function () {
            return Object.assign(doozy.action(), {
                durationInput: null,
                durationDisplay: null,
                nextDateInput: null,
                nextDateDisplay: null,
                logEntriesLastUpdated: new Date().toISOString(),
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
                viewMode: 'general',
            });
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Action');
        },
        componentDidMount: function () {
            this.setupTagsInput();

            // Size text area to the scrollheight
            // and continue resizing on change
            var resizeTextArea = function () {
                if (Math.abs($(this).height() - this.scrollHeight) > 16) {
                    $(this).height(0).height(this.scrollHeight);
                }
            };
            $(this.refs.content.getDOMNode()).on( 'change keyup keydown paste cut', resizeTextArea).change();

            /**
             * Set focus to the name control
             */
            if (this.props.mode === 'Add') {
                $(this.refs.name.getDOMNode()).focus();
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleChange: function (event) {
            var state = {};
            if (event.target === this.refs.name.getDOMNode()) {
                state.name = event.target.value;
            }
            else if (event.target === this.refs.content.getDOMNode()) {
                state.content = event.target.value;
            }
            else if (event.target === this.refs.duration.getDOMNode()) {
                var durationParsed = babble.get('durations').translate(this.refs.duration.getDOMNode().value.trim());
                var duration = 0;
                var durationDisplay = '';
                if (durationParsed.tokens.length > 0) {
                    duration = durationParsed.tokens[0].value.toMinutes();
                    durationDisplay = durationParsed.tokens[0].value.toString('minutes');
                }

                state.duration = duration;
                state.durationInput = this.refs.duration.getDOMNode().value;
                state.durationDisplay = durationDisplay;


            }
            else if (event.target === this.refs.repeat.getDOMNode()) {
                state.repeat = event.target.value;
            }
            else if (event.target === this.refs.begindate.getDOMNode()) {

                var beginDateValue = Date.create(event.target.value);
                var beginDateDisplay = '';
                try {
                    beginDateDisplay = beginDateValue.toISOString();
                }
                catch (e) {
                    if (e instanceof RangeError) {
                        beginDateValue = null;
                    }
                    else {
                        throw e;
                    }
                }

                if (beginDateValue !== null) {
                    if (beginDateValue.getHours() === 0 && beginDateValue.getMinutes() === 0) {
                        beginDateDisplay = beginDateValue.toLocaleDateString();
                    }
                    else {
                        beginDateDisplay = beginDateValue.toLocaleDateString() + ' ' + beginDateValue.toLocaleTimeString();
                    }
                }

                state.beginDate = beginDateValue;
                state.beginDateInput = event.target.value;
                state.beginDateDisplay = beginDateDisplay;
            }
            else if (event.target === this.refs.nextdate.getDOMNode()) {

                var nextDateValue = Date.create(event.target.value);
                var nextDateDisplay = '';
                try {
                    nextDateDisplay = nextDateValue.toISOString();
                }
                catch (e) {
                    if (e instanceof RangeError) {
                        nextDateValue = null;
                    }
                    else {
                        throw e;
                    }
                }

                if (nextDateValue !== null) {
                    if (nextDateValue.getHours() === 0 && nextDateValue.getMinutes() === 0) {
                        nextDateDisplay = nextDateValue.toLocaleDateString();
                    }
                    else {
                        nextDateDisplay = nextDateValue.toLocaleDateString() + ' ' + nextDateValue.toLocaleTimeString();
                    }
                }

                state.nextDate = nextDateValue;
                state.nextDateInput = event.target.value;
                state.nextDateDisplay = nextDateDisplay;
            }
            else if (this.refs.repeatInterval && event.target === this.refs.repeatInterval.getDOMNode()) {
                state.repeatInterval = parseInt(event.target.value, 10);
            }
            else if (this.refs.repeatSun && event.target === this.refs.repeatSun.getDOMNode()) {
                state.repeatSun = event.target.checked;
            }
            else if (this.refs.repeatMon && event.target === this.refs.repeatMon.getDOMNode()) {
                state.repeatMon = event.target.checked;
            }
            else if (this.refs.repeatTue && event.target === this.refs.repeatTue.getDOMNode()) {
                state.repeatTue = event.target.checked;
            }
            else if (this.refs.repeatWed && event.target === this.refs.repeatWed.getDOMNode()) {
                state.repeatWed = event.target.checked;
            }
            else if (this.refs.repeatThu && event.target === this.refs.repeatThu.getDOMNode()) {
                state.repeatThu = event.target.checked;
            }
            else if (this.refs.repeatFri && event.target === this.refs.repeatFri.getDOMNode()) {
                state.repeatFri = event.target.checked;
            }
            else if (this.refs.repeatSat && event.target === this.refs.repeatSat.getDOMNode()) {
                state.repeatSat = event.target.checked;
            }
            else if (event.target === this.refs.ispublic.getDOMNode()) {
                state.isPublic = event.target.checked;
            }
            else if (event.target === this.refs.ordinal.getDOMNode()) {
                var ord = null;
                if (!isNaN(parseInt(event.target.value, 10))) {
                    ord = parseInt(event.target.value, 10);
                }
                state.ordinal = ord;
            }

            this.setState(state);
        },
        handleCancelClick: function () {
            host.go('/doozy/actions');
        },
        handleDeleteClick: function () {
            host.prompt('Are you sure you want to delete this action?\n\nIf so, type DELETE and hit enter', function (response) {
                if ((response || '').toLowerCase() === 'delete') {
                    actionStore.destroy(this.props.id);
                    host.go('/doozy/actions');
                }
            }.bind(this));
        },
        handleSaveClick: function () {

            var action;
            if (this.state.id) {
                action = actionStore.get(this.state.id);
            }
            // set name of new or existing action
            if (!action) {
                action = doozy.action(this.state.name);
            }
            else {
                action = Object.assign({}, action);
                action.name = this.state.name;
            }

            // set other props
            action.content = this.state.content;

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
            }
            else if (this.state.repeat === 'w' && (
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
            }
            else if (this.state.repeat === 'm') {
                var monthlyRule = 'RRULE:FREQ=MONTHLY';
                if (this.state.repeatInterval > 1) {
                    monthlyRule += ';INTERVAL=' + this.state.repeatInterval;
                }
                recurrenceRules.push(monthlyRule);
            }
            else if (this.state.repeat === 'y') {
                var yearlyRule = 'RRULE:FREQ=YEARLY';
                if (this.state.repeatInterval > 1) {
                    yearlyRule += ';INTERVAL=' + this.state.repeatInterval;
                }
                recurrenceRules.push(yearlyRule);
            }
            action.recurrenceRules = recurrenceRules;
            action.ordinal = this.state.ordinal;

            // build next date
            action.beginDate = this.state.beginDate;
            action.nextDate = this.state.nextDate;

            // call method to save the action
            if (this.props.mode === 'Edit') {
                actionStore.update(action);
            }
            else {
                actionStore.create(action);
            }

            host.go('/doozy/actions');
        },
        handleModelUpdate: function (model) {
            if (!model) {
                this.setState(this.getInitialState());    
                return;
            }
            var beginDateInput, nextDateInput, durationInput;

            // create a copy of the action for editing
            var editableCopy = {};
            Object.assign(editableCopy, model);

            // flag to call modal's graceful open dialog function
            this.show = true;

            var id = editableCopy.id;
            if (!actionStore.get(id)) {
                id = null;
            }
            var name = editableCopy.name;
            var content = editableCopy.content;

            var durationParse = babble.get('durations').translate(editableCopy.duration + ' min');
            if (durationParse.tokens.length === 0) {
                durationInput = null;
            }
            else {
                durationInput = durationParse.tokens[0].value.toString();
            }

            if (model.nextDate === null || String(model.nextDate) === 'NaN') {
                nextDateInput = null;
            }
            else {
                nextDateInput = (new Date(model.nextDate)).toLocaleDateString();
            }

            if (model.beginDate === null || String(model.beginDate) === 'NaN') {
                beginDateInput = null;
            }
            else {
                beginDateInput = (new Date(Date.parse(model.beginDate))).toLocaleDateString();
            }
            
            // build state
            var state = {
                id: id,
                name: name,
                content: content,
                durationInput: durationInput,
                durationDisplay: null,
                beginDate: editableCopy.beginDate,
                beginDateInput: beginDateInput,
                beginDateDisplay: null,
                nextDate: editableCopy.nextDate,
                nextDateInput: nextDateInput,
                nextDateDisplay: null,
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
                repeatSat: false,
                tags: editableCopy.tags
            };

            if (editableCopy.recurrenceRules && editableCopy.recurrenceRules.length) {
                var recurrenceObj = doozy.parseRecurrenceRule(editableCopy.recurrenceRules[0]);
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

            // // create a copy of the action for editing
            // var state = {};
            // Object.assign(state, model);

            // var durationParse = babble.get('durations').translate(state.duration + ' min');
            // var durationInput = null;
            // if (durationParse.tokens.length !== 0) {
            //     durationInput = durationParse.tokens[0].value.toString();
            // }

            // // If actionId is set, we don't need the action name
            // if (state.actionId && state.actionName) {
            //     state.actionName = null;
            // }

            // state.durationInput = durationInput;
            // state.nextDateInput = Date.create(model.date).toLocaleDateString();
            // state.dateFeedback = '';

            // this.setState(state);
        },
        handleStoresMixinUpdate: function (storeName) {
            if (storeName === 'Tag') {
                this.setupTagsInput();    
            }
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
            var beginDateInput = this.state.beginDateInput;
            
            if (repeat === 'w') {

                /**
                 * Render day of week checkboxes in order
                 * based on the user's start of week
                 */
                var dayIndex = 0; // TODO: reimplement preferences store - userStore.getCache().weekStarts;
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
                    </div>,
                    <div className="form-group">
                        <label htmlFor="action-begindate">Beginning on</label>
                        <input id="action-begindate" ref="begindate" type="datetime" className="form-control" value={beginDateInput} onChange={this.handleChange} />
                        <span>{this.state.beginDateDisplay}</span>
                    </div>
                ]);
            }
            else if (repeat === 'd' || repeat === 'm' || repeat === 'y') {
                return ([
                    <div className="form-group">
                        <label htmlFor="action-repeat-interval">Every</label>
                        <input id="action-repeat-interval" ref="repeatInterval" type="number" className="form-control" value={this.state.repeatInterval} onChange={this.handleChange} />
                        <label>{doozy.getFrequencyName(this.state.repeat) + '(s)'}</label>
                    </div>,
                    <div className="form-group">
                        <label htmlFor="action-begindate">Beginning on</label>
                        <input id="action-begindate" ref="begindate" type="datetime" className="form-control" value={beginDateInput} onChange={this.handleChange} />
                        <span>{this.state.beginDateDisplay}</span>
                    </div>
                ]);
            }
            else {
                return null;
            }
        },

        render: function () {


            /**
             * State and Prop Dependencies
             */
            var durationInput = this.state.durationInput;
            var nextDateInput = this.state.nextDateInput;

            /**
             * Sub Renders
             */
            var repeatOptions = this.renderRepeatOptions();

            /**
             * Render
             */
            return (
                <div style={styles.main}>
                    <h2 style={{marginTop: '0.2rem', marginBottom: '0.2rem'}}>{this.props.mode === 'Edit' ? this.state.name : 'New Action'}</h2>
                    <form role="form">
                        <div className="form-group">
                            <label htmlFor="action-name">Name</label>
                            <input id="action-name" ref="name" type="text" className="form-control" placeholder="Name of action" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tags">Tags</label>
                            <input id="tags" ref="tags" type="text" />
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
                            <input id="action-nextdate" ref="nextdate" type="datetime" className="form-control" value={nextDateInput} onChange={this.handleChange} />
                            <span>{this.state.nextDateDisplay}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="action-ordinal">What ordinal?</label>
                            <input id="action-ordinal" ref="ordinal" type="number" className="form-control" value={this.state.ordinal} onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="action-ispublic">Allow others to see this action?</label>
                            <input id="action-ispublic" ref="ispublic" type="checkbox" className="form-control" checked={this.state.isPublic} onChange={this.handleChange} />
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

    return ManageAction;
}));
