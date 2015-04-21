//Dependencies: underscore.js

//#region Focus - Base
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
//#endregion

//#region Tag - Base
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
//#endregion

//#region Action - Base
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

// instance methods
Action.prototype.getDuration = function () {

    if (this.items.length === 0) {
        return this.duration;
    } else {
        var duration = 0;
        for (var i = 0; i < this.items.length; i++) {
            duration += this.items[i].getDuration();
        }
        return duration;
    }
};

Action.prototype.getFormattedDuration = function () {
    return hldatetime.formatDuration(this.getDuration());
};

// static methods
Action.prototype.formatTime = function (minutes) {
    var hours = 0;
    if (minutes < 60) {
        return '0:' + minutes;
    } else {
        var leftover = minutes % 60;

        hours = (minutes - leftover) / 60;

        return (hours < 10 ? '0' + hours : hours) + ':' + (leftover < 10 ? '0' + leftover : leftover);
    }
};
//#endregion

//#region Flow
var Flow = function (name, tags) {
    Action.call(this, name, tags);
    this.kind = 'Flow';
    this.items = [];
};
Flow.prototype = Object.create(Action.prototype);
Flow.prototype.constructor = Flow;
//#endregion 

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

var filterActions = function (actions, tags, type) {
    // no filter, return all
    if (typeof tags === 'undefined' || tags === null|| tags.length === 0) {
        return actions;
    }

    if (typeof type !== 'string') {
        type = 'any';
    }
    
    // filter is a string, convert to array
    if (typeof tags === 'string') {
        tags = [tags];
    }

    // get actions that match at least one of the filter tags
    if (type === 'any') {
        return actions.filter(function (item) { return _.intersection(tags, item.tags).length > 0; });
    } else if (type === 'all') {
        return actions.filter(function (item) { return _.intersection(tags, item.tags).length === tags.length; });
    }
};

var getRecurrenceObj = function (item) {

    var kind = item.split(':');

    // date lists: RDATE, EXDATE
    if (kind[0] === 'RDATE' || kind[0] === 'EXDATE') {
        var dateStrings = kind[1].split(',');
        var dates = [];
        // convert to array of datetime integers for easy comparison with underscore
        dateStrings.map(function (item) {
            if (item.length === 10) {
                // not standard but easier for me
                dates.push(hldatetime.getLocalDate(item).getTime());
            } else {
                // standard based
                dates.push(new Date(item).getTime());
            }
        });
        return {
            kind: kind[0],
            dates: dates
        };
    }

    // rules: RRULE, EXRULE
    var rule = {
        kind: kind[0],
        freq: null,
        count: 365000, // covers daily for 1000 years to avoid null check
        interval: 1,
        byday: null
    };

    var props = kind[1].split(';');

    for (var i = 0; i < props.length; i++) {
        // split key from value
        var keyval = props[i].split('=');

        if (keyval[0] === 'BYDAY') {
            rule.byday = [];
            var byday = keyval[1].split(',');
            for (var j = 0; j < byday.length; j++) {
                if (byday[j].length === 2) {
                    rule.byday.push({ day: byday[j], digit: 0 });
                } else {
                    // handle digit
                    var day = byday[j].slice(-2);
                    var digit = parseInt(byday[j].slice(0, byday[j].length - 2));
                    rule.byday.push({ day: day, digit: digit });
                }
            }
        } else if (keyval[0] === 'INTERVAL') {
            rule[keyval[0].toLowerCase()] = parseInt(keyval[1]);
        } else {
            rule[keyval[0].toLowerCase()] = keyval[1];
        }
    }

    return rule;
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
        var thisday = hldatetime.daysOfWeek[today.getDay()].slice(0, 2).toUpperCase();

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
            if (item.enlist === null || hldatetime.getLocalDate(item.enlist) > date || (item.retire !== null && hldatetime.getLocalDate(item.retire) <= date)) {
                return;
            }

            // use this to calculate intervals from enlist date
            var enlist = hldatetime.getLocalDate(item.enlist);

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

var getRecurrenceSummary = function (recurrenceRules) {
    if (!recurrenceRules || recurrenceRules.length === 0) {
        return null;   
    }
    
    var summary = '';
    recurrenceRules.forEach(function(item, index, array) {
        var recurrenceObj = getRecurrenceObj(item);
        

        if (recurrenceObj.byday) {
            var days = {
                SU: false,
                MO: false,
                TU: false,
                WE: false,
                TH: false,
                FR: false,
                SA: false
            };
            // build days object
            for (var i = 0; i < recurrenceObj.byday.length; i++) {
                days[recurrenceObj.byday[i].day] = true;
            }
            
            var twoCharDays = _.pluck(recurrenceObj.byday, 'day');
            var fullnameDays = hldatetime.daysOfWeek.filter(function(item) {
                return twoCharDays.indexOf(item.slice(0,2).toUpperCase()) > -1;
            });
            
            if (recurrenceObj.interval > 1) {
                if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
                    summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq) + ' on the weekend';
                } else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
                    summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq) + ' on the weekdays';
                } else {
                    summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq) + ' on ' + fullnameDays.join(', ');
                }
            } else {
                if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
                    summary = 'Weekends';
                } else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
                    summary = 'Weekdays';
                } else {
                    summary = 'Every ' + fullnameDays.join(', ');
                }
            }
        } else {
            if (recurrenceObj.interval > 1) {
                summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq) + 's';
            } else {
                summary = 'Every ' + getFrequencyNoun(recurrenceObj.freq);
            }
            
        }
    });
    
    return summary;
};

var getFrequencyNoun = function (freq) {
    if (freq === 'WEEKLY') {
        return 'week';   
    } else if (freq === 'MONTHLY') {
        return 'month';   
    } else if (freq === 'DAILY') {
        return 'day';   
    }
};

var TAG_PREFIX = {
    FOCUS: '!',
    PLACE: '@',
    GOAL: '>',
    NEED: '$',
    BOX: '#'
}

/**
 * Parses a tag string to an object
 */
var parseTag = function (tag) {
    var kind = 'Tag';
    var name = tag;
    
    /**
     * Compare first char of tag to
     * determine if it is a special tag
     */
    var firstChar = name.slice(0,1);
    if (firstChar === TAG_PREFIX.FOCUS) {
        kind = 'Focus'; // part of
    } else if (firstChar === TAG_PREFIX.PLACE) {
        kind = 'Place'; // where
    } else if (firstChar === TAG_PREFIX.GOAL) {
        kind = 'Goal'; // to what end
    } else if (firstChar === TAG_PREFIX.NEED) {
        kind = 'Need'; // why
    } else if (firstChar === TAG_PREFIX.BOX) {
        kind = 'Box'; // when
    }
    
    /**
     * Separate the name from the 
     * prefix when it is a special tag
     */
    if (kind !== 'Tag') {
        name = name.slice(1);   
    }
    
    /**
     * Return tag object
     */
    return {
        value: tag,
        kind: kind,
        name: name
    };
};

//#region Objective
//var Objective = function (name, tags) {

//    // ensure name was supplied
//    if (typeof name === 'undefined') {
//        throw 'name is required';
//    }

//    // set instance variables
//    this.id = new Date().getTime().toString();
//    this.kind = 'Objective';
//    this.name = name;
//    this.enlist = null;
//    this.retire = null;
//    this.latestEntry = null;
//    // count in TARGET context means 3 actions, optionally add UNIT=MINUTE to treat TARGET as number of minutes in specified recurrence
//    // TARGET defaults to 1, UNIT defaults to ACTION
//    this.target = ["RRULE:FREQ=WEEKLY;TARGET=1;"];
//    this.tags = [];
//    this.items = [];
//    this.content = null;
    
//    // add tags any were supplied
//    if (typeof tags !== 'undefined') {
//        if (typeof tags === 'string') {
//            this.tags.push(tags);
//        } else if (Object.prototype.toString.call(tags) === '[object Array]') {
//            this.tags = tags;
//        }
//    }
//};
//#endregion