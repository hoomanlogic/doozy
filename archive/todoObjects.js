//Dependencies: underscore.js

var Focus = function () {

    // ensure name was supplied
    if (typeof name === 'undefined') {
        throw 'name is required';
    }

    // set instance variables
    this.isNew = true;
    this.ref = hlcommon.uuid();
    this.id = this.ref;
    this.kind = 'Role';
    this.name = '';
    this.tagName = '';
};

var Tag = function (name, tags) {

    // ensure name was supplied
    if (typeof name === 'undefined') {
        throw 'name is required';
    }

    // set instance variables
    this.id = new Date().getTime().toString();
    this.kind = 'Tag';
    this.name = name;
    this.path = '/' + name + '/';
    this.parent = null;
    this.items = [];
};

var Action = function (name, tags) {

    // ensure name was supplied
    if (typeof name === 'undefined') {
        throw 'name is required';
    }

    // set instance variables
    this.ref = hlcommon.uuid();
    this.id = this.ref;
    this.kind = 'Action';
    this.name = name;
    this.enlist = new Date();
    this.retire = null;
    this.latestEntry = null;
    this.recurrenceRules = [];
    this.startAt = null;
    this.duration = 0;
    this.items = [];
    this.tags = [];
    this.objectives = [];
    this.content = null;
    this.created = new Date();
    this.lastPerformed = null;
    this.logEntries = [];
    this.nextDate = null;

    // add tags any were supplied
    if (typeof tags !== 'undefined') {
        if (typeof tags === 'string') {
            this.tags.push(tags);
        } else if (Object.prototype.toString.call(tags) === '[object Array]') {
            this.tags = tags;
        }
    }
};

Action.prototype = {
    getDuration: function () {

        if (this.items.length === 0) {
            return this.duration;
        } else {
            var duration = 0;
            for (var i = 0; i < this.items.length; i++) {
                duration += this.items[i].getDuration();
            }
            return duration;
        }
    },
    getFormattedDuration: function () {
        return babble.durations.formatDuration(this.getDuration());
    },
    formatTime: function (minutes) {
        var hours = 0;
        if (minutes < 60) {
            return '0:' + minutes;
        } else {
            var leftover = minutes % 60;

            hours = (minutes - leftover) / 60;

            return (hours < 10 ? '0' + hours : hours) + ':' + (leftover < 10 ? '0' + leftover : leftover);
        }
    }
};

var Flow = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'Flow';
    this.items = [];
};

Flow.prototype = Object.create(Action.prototype);
Flow.prototype.constructor = Flow;

//#region Block
// Blocks can change the current focus and allow actions to be dropped into them.
// Blocks generally contain only actions. If the focus should change within the day, it should end the block and create a new block with the new focus.
var Block = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'Block';
};
Block.prototype = Object.create(Action.prototype);
Block.prototype.constructor = Block;
//#endregion

//#region ToDo
var ToDo = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'ToDo';
};
ToDo.prototype = Object.create(Action.prototype);
ToDo.prototype.constructor = ToDo;
//#endregion

//#region Project
var Project = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'Project';
};
Project.prototype = Object.create(Action.prototype);
Project.prototype.constructor = Project;
//#endregion

//#region Milestone
var Milestone = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'Milestone';
};
Milestone.prototype = Object.create(Action.prototype);
Milestone.prototype.constructor = Milestone;
//#endregion 

//#region Log
// Log - action type that logs answers to questions
// Question object:  question, unit: (yes/no,freetext,duration,weight,miles,kilometers,percentage,rating), answer
var Log = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'Log';
    this.questions = [];
};
Log.prototype = Object.create(Action.prototype);
Log.prototype.constructor = Log;

var Question = function (question, unit, choices) {
    this.question = question;
    this.unit = unit;
    this.choices = [];
    this.answer = null;
    if (typeof choices !== 'undefined') {
        this.choices = choices;
    }
};

var LOG_UNIT = {
    YES_NO: 'yes/no',
    FREETEXT: 'freetext',
    DURATION: 'duration',
    WEIGHT: 'weight',
    MILES: 'miles',
    KILOMETERS: 'kilometers',
    PERCENTAGE: 'percentage',
    RATING: 'rating',
    CHOICE: 'choice'
};
//#endregion

//#region Objective
var Objective = function (name, tags) {

    // ensure name was supplied
    if (typeof name === 'undefined') {
        throw 'name is required';
    }

    // set instance variables
    this.id = new Date().getTime().toString();
    this.kind = 'Objective';
    this.name = name;
    this.enlist = null;
    this.retire = null;
    this.latestEntry = null;
    // count in TARGET context means 3 actions, optionally add UNIT=MINUTE to treat TARGET as number of minutes in specified recurrence
    // TARGET defaults to 1, UNIT defaults to ACTION
    this.target = ["RRULE:FREQ=WEEKLY;TARGET=1;"];
    this.tags = [];
    this.items = [];
    this.content = null;
    
    // add tags any were supplied
    if (typeof tags !== 'undefined') {
        if (typeof tags === 'string') {
            this.tags.push(tags);
        } else if (Object.prototype.toString.call(tags) === '[object Array]') {
            this.tags = tags;
        }
    }
};
//#endregion

var setProtoActions = function (actions) {
    // actions root
    actions.map( function (item) {
        setProtoAction(item);
    });

    return actions;
};

var setProtoAction = function (action) {
    if (action.kind === 'Action') {
        action.__proto__ = Action.prototype;
    } else if (action.kind === 'Flow') {
        action.__proto__ = Flow.prototype;
        setProtoActions(action.items);
    } else if (action.kind === 'ToDo') {
        action.__proto__ = ToDo.prototype;
    } else if (action.kind === 'Block') {
        action.__proto__ = Block.prototype;
        setProtoActions(action.items);
    } else if (action.kind === 'Log') {
        action.__proto__ = Log.prototype;
    } else if (action.kind === 'Project') {
        action.__proto__ = Project.prototype;
    } else if (action.kind === 'Milestone') {
        action.__proto__ = Milestone.prototype;
    }
};

var processRecurrence = function (today, enlist, rule) {

    if (rule.kind === 'RDATE' || rule.kind === 'EXDATE') {
        return _.contains(rule.dates, today.getTime());
    }

    if (rule.interval === 1 && rule.byday === null && rule.count === 365000) {
        // simple comparison, daily is always true
        if (rule.freq === 'DAILY') {
            // daily is always true
        } else if (rule.freq === 'WEEKLY') {
            // weekly
            if (today.getDay() !== enlist.getDay()) {
                return false;
            }
        } else if (rule.freq === 'MONTHLY') {
            // monthly
            if (today.getDate() !== enlist.getDate()) {
                return false;
            }
        } else if (rule.freq === 'YEARLY') {
            // yearly
            if (today.getMonth() !== enlist.getMonth() || today.getDate() !== enlist.getDate()) {
                return false;
            }
        } else {
            throw 'Unrecognized frequency';
        }

    } else if ((rule.interval > 1 || rule.count < 365000) && rule.byday === null) {
        // we have an interval or a count, so we need to step through each date the rule falls on
        var counter = 1;
        var matched = false;
        if (rule.freq === 'DAILY') {
            // daily
            while (enlist <= today && counter <= rule.count) {
                // check for match
                if (enlist.getTime() === today.getTime()) {
                    matched = true;
                    break;
                }

                // continue with interval
                enlist.setDate(enlist.getDate() + rule.interval);
                counter++;
            }
        } else if (rule.freq === 'WEEKLY') {
            // weekly
            while (enlist <= today && counter <= rule.count) {
                // check for match
                if (enlist.getTime() === today.getTime()) {
                    matched = true;
                    break;
                }

                // continue with interval
                enlist.setDate(enlist.getDate() + (7 * rule.interval));
                counter++;
            }
        } else if (rule.freq === 'MONTHLY') {
            // monthly
            while (enlist <= today && counter <= rule.count) {
                // check for match
                if (enlist.getTime() === today.getTime()) {
                    matched = true;
                    break;
                }

                // continue with interval
                enlist.setMonth(enlist.getMonth() + rule.interval);
                counter++;
            }
        } else if (rule.freq === 'YEARLY') {
            // yearly
            while (enlist <= today && counter <= rule.count) {
                // check for match
                if (enlist.getTime() === today.getTime()) {
                    matched = true;
                    break;
                }

                // continue with interval
                enlist.setYear(enlist.getYear() + rule.interval);
                counter++;
            }
        }
        // we didn't match the date
        if (matched === false) {
            return false;
        }
    } else {
        // complex stepping 
        var thisday = babble.moments.daysOfWeek[today.getDay()].slice(0, 2).toUpperCase();

        if (rule.byday.length === _.where(rule.byday, { digit: 0 }).length) {
            // simple byday
            var days = _.pluck(rule.byday, 'day');
            if (_.contains(days, thisday) === false) {
                return false;
            }
        } else {
            // oh shit, we have some thinking to do

            // if yearly, then it would be the nth day of the week of the year

            return false;
        }

    }

    return true;
};

var calculateOccurs = function (actions, date) {
    var today = [];

    // used in calculations, default to today
    if (typeof date === 'undefined') {
        date = new Date().getMidnight();
    }

    // process supplied actions and return matches for todays date
    actions.map( function (item) {
        if (item.kind === 'Flow' || item.kind === 'Block') {
            
            setProtoAction(item);

            // first we make sure this action meets enlist and retire rules
            if (item.enlist === null || babble.moments.getLocalDate(item.enlist) > date || (item.retire !== null && babble.moments.getLocalDate(item.retire) <= date)) {
                return;
            }

            // use this to calculate intervals from enlist date
            var enlist = babble.moments.getLocalDate(item.enlist);

            // calculate if action occurs today
            var occursToday = false;
            if (item.recurrenceRules.length === 0) {
                // no recurrence, is enlist today?
                occursToday = (enlist.getTime() === date.getTime());
            } else {
                // step through recurrence rules
                for (var i = 0; i < item.recurrenceRules.length; i++) {
                    var recur = getRecurrenceObj(item.recurrenceRules[i]);
                    var match = processRecurrence(date, new Date(enlist.getTime()), recur);
                    if (match === true && (recur.kind === 'RRULE' || recur.kind === 'RDATE')) {
                        // might occur unless an exception overrides it
                        occursToday = true;
                    } else if (match === true && (recur.kind === 'EXRULE' || recur.kind === 'EXDATE')) {
                        // only takes one exception match to rule it out
                        occursToday = false;
                        break;
                    }
                }
            }

            // add to todays actions
            if (occursToday) {
                today.push(item);
            }
        }
    });

    return today;
};