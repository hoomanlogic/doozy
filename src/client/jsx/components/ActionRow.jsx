/** @jsx React.DOM */

// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('react'),
            require('../../../../../babble/src/durations')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            'react',
            '../../../../../babble/src/durations'
        ], factory);
	}
	else {
		// Global (browser)
		root.ActionRow = factory(
            root.React,
            root.babble
        );
	}
}(this, function (React, babble) {
    'use strict';
    return React.createClass({
        mixins: [React.addons.PureRenderMixin],
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                windowWidth: window.innerWidth
            };
        },

        componentWillMount: function () {
            var nameChange = EventHandler.create();
            nameChange
                .map(function (event) {
                    return event.target.value;
                })
                .throttle(1000)
                .filter(function (name) {
                    return name.length > 2 && name !== this.props.action.name;
                }.bind(this))
                .distinctUntilChanged()
                .subscribe(this.handleNameChange);

            this.handlers = {
                nameChange: nameChange
            };
        },
        componentDidMount: function() {
            window.addEventListener('resize', this.handleResize);
        },

        componentWillUnmount: function () {
            this.handlers.nameChange.dispose();
            window.removeEventListener('resize', this.handleResize);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCheck: function(event) {
            if (ui.logAction && event.target.checked) {
                ui.logAction(this.props.action);
            } else {
                var result = prompt('Are you sure?');
                if (result && result.slice(0,1).toLowerCase() === 'y') {
                    actionStore.toggle(this.props.action);
                }
            }
        },
        handleCheckTouch: function () {
            this.preventTouch = true;
        },
        handleClick: function(event) {
            ui.editAction(this.props.action);
        },
        handleTouchStart: function(event) {
            this.isTap = true;
        },
        handleTouchMove: function(event) {
            this.isTap = false;
        },
        handleTouchEnd: function(event) {
            if (this.isTap && !this.preventTouch) {
                this.handleClick();
                event.preventDefault();
            }
            this.isTap = false;
            this.preventTouch = false;
        },
        handleNameChange: function (name) {
            actionStore.update({ actionRef: this.props.actionRef, state: { name: name } });
        },
        handleResize: function(e) {
            this.setState({windowWidth: window.innerWidth});
        },

        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        calcHoverText: function () {
            var hoverText = '',
                minutesTally = 0,
                earliestDate = null,
                latestDate = null;

            if (this.props.action.logEntries === void 0) {
                hoverText = this.props.actionLastPerformed;
            } else {
                for (var i = 0; i < this.props.action.logEntries.length; i++) {
                    var duration = this.props.action.logEntries[i].duration || 0;
                    minutesTally += duration;
                    if (this.props.action.logEntries[i].entry === 'performed') {
                        earliestDate = earliestDate === null ? this.props.action.logEntries[i].date : (earliestDate > this.props.action.logEntries[i].date ? this.props.action.logEntries[i].date : earliestDate);
                        latestDate = latestDate === null ? this.props.action.logEntries[i].date : (latestDate < this.props.action.logEntries[i].date ? this.props.action.logEntries[i].date : latestDate);
                    }
                    hoverText += this.props.action.logEntries[i].entry + (duration ? (' for ' + duration + 'm ') : '') + ' on ' + 
                        this.props.action.logEntries[i].date.toLocaleDateString() + ' (' + hlapp.calcNaturalDays(this.props.action.logEntries[i].date) + ') ' +
                        (this.props.action.logEntries[i].details ? ': ' + this.props.action.logEntries[i].details : '') + 
                        '\n';   
                }
                if (minutesTally) {
                    var numWeeks = babble.durations.dayDiff(earliestDate, latestDate) / 7;
                    hoverText = 'Average minutes per week: ' + String(minutesTally / numWeeks) + '\n\n' + hoverText;
                }
            }

            return hoverText;
        },

        calcIsDone: function () {
            return this.props.actionRetire !== null || (this.props.actionLastPerformed !== null && (this.props.actionNextDate === null || this.props.actionNextDate > new Date()));
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var details,
                hoverText,
                isDone,
                repeats;

            isDone = this.calcIsDone();
            hoverText = this.calcHoverText();

            /**
             * Render icon to signify that there are details attached to this action
             */
            if (this.props.action.content && this.props.action.content.length > 0) {
                details = (
                    <span> <i className="fa fa-paperclip" title={this.props.action.content}></i></span>
                );
            }

            /**
             * Render icon to signify that the icon is repetitious
             */
            if (this.props.action.recurrenceRules && this.props.action.recurrenceRules.length > 0) {
                repeats = (
                    <span> <i className="fa fa-repeat" title={hlapp.getRecurrenceSummary(this.props.action.recurrenceRules)}></i></span>
                );
            }

            return (
                <tr className={'highlight-hover' + (isDone ? ' done' : '')} onDoubleClick={this.handleClick} onTouchStart={this.handleTouchStart} onTouchMove={this.handleTouchMove} onTouchEnd={this.handleTouchEnd}>
                    <td width="5px" style={{padding: '0 0 0 5px'}}><input style={{height: '18px', width: '18px'}} type="checkbox" onChange={this.handleCheck} onTouchStart={this.handleCheckTouch} checked={isDone} /></td>
                    <td>
                        <ContentEditable html={this.props.actionName} onChange={this.handlers.nameChange} />
                        {details}
                        {repeats}
                    </td>
                    <td width="150px" hidden={this.state.windowWidth < 600 ? true : false} title={hoverText}>{this.props.actionLastPerformed ? hlapp.calcNaturalDays(this.props.actionLastPerformed) : ''}</td>
                </tr>
            );
        }
    });
}));