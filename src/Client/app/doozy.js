(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/common'),
        require('hl-common-js/src/those'),
        require('lodash'),
        require('babble')
    );
}(function (hlcommon, those, _, babble) {

    var TAG_KIND = {
        FOCUS: '!',
        PLACE: '@',
        GOAL: '>',
        NEED: '$',
        BOX: '#',
        TAG: ''
    };

    var TAG_PREFIXES = ['!','@','>','$','#'];

    var TARGET_MEASURE = {
        EXECUTION: 0,
        PROGRESS: 1,
        DURATION: 2
    };

    var TARGET_PERIOD = {
        YEARS: 0,
        MONTHS: 1,
        WEEKS: 2,
        DAYS: 3
    };

    var getFrequencyName = function (freq) {
        return {
            w: 'Week',
            m: 'Month',
            y: 'Year',
            d: 'Day'
        }[freq.slice(0,1).toLowerCase()];
    };

    /**
     * Parse an iCal RRULE, EXRULE, RDATE, or EXDATE string
     * and return a recurrence object
     */
    var parseRecurrenceRule = function (icalRule) {

        var kind = icalRule.split(':');

        // date lists: RDATE, EXDATE
        if (kind[0] === 'RDATE' || kind[0] === 'EXDATE') {
            var dateStrings = kind[1].split(',');
            var dates = [];
            // convert to array of datetime integers for easy comparison with underscore
            dateStrings.map(function (item) {
                if (item.length === 10) {
                    // not standard but easier for me
                    dates.push(babble.moments.getLocalDate(item).getTime());
                }
                else {
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
                    }
                    else {
                        // handle digit
                        var day = byday[j].slice(-2);
                        var digit = parseInt(byday[j].slice(0, byday[j].length - 2), 10);
                        rule.byday.push({ day: day, digit: digit });
                    }
                }
            }
            else if (keyval[0] === 'INTERVAL') {
                rule[keyval[0].toLowerCase()] = parseInt(keyval[1], 10);
            }
            else {
                // freq and the rest of the props
                rule[keyval[0].toLowerCase()] = keyval[1];
            }
        }

        return rule;
    };
    
    var processRecurrence = function (today, enlist, rule) {
        if (['RDATE', 'EXDATE'].indexOf(rule.kind) > -1) {
            return rule.dates.indexOf(today.getTime()) > -1;
        }

        if (rule.interval === 1 && rule.byday === null && rule.count === 365000) {
            // simple comparison, daily is always true
            switch (rule.freq) {
                case ('DAILY'):
                    // DO NOTHING - RETURN TRUE BELOW
                    break;
                case ('WEEKLY'):
                    if (today.getDay() !== enlist.getDay()) {
                        return false;
                    }
                    break;
                case ('MONTHLY'):
                    if (today.getDate() !== enlist.getDate()) {
                        return false;
                    }
                    break;
                case ('YEARLY'):
                    if (today.getMonth() !== enlist.getMonth() || today.getDate() !== enlist.getDate()) {
                        return false;
                    }
                    break;
                default:
                    throw new Error('Unrecognized frequency');
            }
        }
        else if ((rule.interval > 1 || rule.count < 365000) && rule.byday === null) {
            // we have an interval or a count, so we need to step through each date the rule falls on
            var counter = 1;
            var matched = false;
            switch (rule.freq) {
                case ('DAILY'):
                    // daily
                    while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count)
                    {
                        // check for match
                        if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0])
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist.setDate(enlist.getDate() + rule.interval);
                        counter++;
                    }
                    break;
                case ('WEEKLY'):
                    // weekly
                    while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count)
                    {
                        // check for match
                        if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0])
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist.setDate(enlist.getDate() + (7 * rule.interval));
                        counter++;
                    }
                    break;
                case ('MONTHLY'):
                    // monthly
                    while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count)
                    {
                        // check for match
                        if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0])
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist.setMonth(enlist.getMonth() + rule.interval);
                        counter++;
                    }
                    break;
                case ('YEARLY'):
                    // yearly
                    while (enlist.toISOString().split('T')[0] <= today.toISOString().split('T')[0] && counter <= rule.count)
                    {
                        // check for match
                        if (enlist.toISOString().split('T')[0] === today.toISOString().split('T')[0])
                        {
                            matched = true;
                            break;
                        }

                        // continue with interval
                        enlist.setYear(enlist.getYear() + rule.interval);
                        counter++;
                    }
                    break;
            }

            // we didn"t match the date
            if (matched === false) {
                return false;
            }
        }
        else {
            debugger;
            // complex stepping 
            // var thisday = today.ToString("ddd").Substring(0, 2).ToUpper();
            // if (rule.ByDay.Count() == rule.ByDay.Where(a => a.Digit == 0).Count())
            // {
            //     // simple byday
            //     var days = rule.ByDay.Select(a => a.Day);
            //     if (days.Contains(thisday) == false) {
            //         return false;
            //     }
            // } else {
            //     // oh shit, we have some thinking to do
            //     // if yearly, then it would be the nth day of the week of the year
            //     return false;
            // }            
        }
        
        return true;
    };

    var getTagValue = function (tag) {
        return TAG_KIND[tag.kind.toUpperCase()] + tag.name;
    };

    var extendAction = function (action) {
        return action;
    };

    var plural = function (noun) {
        var vowels = ['a','e','i','o','u'];
        if (noun[noun.length - 1] === 'y' && vowels.indexOf(noun[noun.length - 2].toLowerCase()) === -1) {
            return noun.substring(0, noun.length - 1) + 'ies';
        }
        else {
            return noun + 's';
        }
    };

    return {

        TAG_KIND: TAG_KIND,

        TAG_PREFIXES: TAG_PREFIXES,

        TARGET_MEASURE: TARGET_MEASURE,

        TARGET_PERIOD: TARGET_PERIOD,

        extrude: function (model, extrude) {
            for (var prop in model) {
                if (model.hasOwnProperty(prop) && extrude.hasOwnProperty(prop)) {
                    model[prop] = extrude[prop];
                }
            }
            return model;
        },

        getFrequencyName: getFrequencyName,

        parseRecurrenceRule: parseRecurrenceRule,
        
        getNextOccurrence: function (recurrenceRules, startFrom, latestOccurrence) {
            var nextDate = null;
            if (recurrenceRules.length) {
                var date = latestOccurrence || startFrom;
                date = new Date(date.getTime());
                date.setDate(date.getDate() + 1);
                
                while (nextDate === null) {
                    var occursToday = false;
                    for (var i = 0; i < recurrenceRules.length; i++) {
                        var recur = parseRecurrenceRule(recurrenceRules[i]);
                        var match = processRecurrence(date, startFrom, recur);
                        if (match && (recur.kind === 'RRULE' || recur.kind === 'RDATE')) {
                            // might occur unless an exception overrides it
                            occursToday = true;
                        }
                        else if (match && (recur.kind === 'EXRULE' || recur.kind === 'EXDATE')) {
                            // only takes on exception match to rule it out
                            occursToday = false;
                            break;
                        }
                    }
                    
                    if (occursToday) {
                        nextDate = new Date(date.getTime());
                    }
                    
                    // iterate another day
                    date.setDate(date.getDate() + 1);
                }
            }
            return nextDate;
        },

        getRecurrenceSummary: function (recurrenceRules) {
            if (!recurrenceRules || recurrenceRules.length === 0) {
                return null;
            }

            var summary = '';
            recurrenceRules.forEach(function (item) {
                var recurrenceObj = parseRecurrenceRule(item);


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
                    recurrenceObj.byday.forEach(function (byday) {
                        days[byday.day] = true;
                    });

                    var twoCharDays = those(recurrenceObj.byday).pluck('day');
                    var fullnameDays = babble.moments.daysOfWeek.filter(function (dayOfWeek) {
                        return twoCharDays.indexOf(dayOfWeek.slice(0,2).toUpperCase()) > -1;
                    });

                    if (recurrenceObj.interval > 1) {
                        if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on the weekend';
                        }
                        else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on the weekdays';
                        }
                        else {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on ' + fullnameDays.join(', ');
                        }
                    }
                    else if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
                        summary = 'Weekends';
                    }
                    else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
                        summary = 'Weekdays';
                    }
                    else {
                        summary = 'Every ' + fullnameDays.join(', ');
                    }
                }
                else if (recurrenceObj.interval > 1) {
                    summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + 's';
                }
                else {
                    summary = 'Every ' + getFrequencyName(recurrenceObj.freq).toLowerCase();
                }
            });

            return summary;
        },

        action: function (name, tags) {

            if (typeof name === 'object' && name.id && name.kind === 'Action') {
                // give action object magical powers
                return extendAction(name);
            }
            else {
                // add tags any were supplied
                var t = [];
                if (typeof tags !== 'undefined') {
                    if (typeof tags === 'string') {
                        t.push(tags);
                    }
                    else if (Object.prototype.toString.call(tags) === '[object Array]') {
                        t = tags;
                    }
                }

                // return object literal
                return extendAction({
                    isNew: true,
                    id: hlcommon.uuid(),
                    kind: 'Action',
                    name: name || '',
                    created: new Date().toISOString(),
                    duration: 0,
                    content: null,
                    beginDate: null,
                    nextDate: null,
                    isPublic: false,
                    lastPerformed: null,
                    tags: t,
                    recurrenceRules: [],
                    items: []
                });
            }
        },

        focus: function (name) {
            return {
                isNew: true,
                id: hlcommon.uuid(),
                kind: 'Role',
                name: name || '',
                tagName: '',
                iconUri: null
            };
        },

        logEntry: function () {
            return {
                isNew: true,
                id: hlcommon.uuid(),
                actionId: null,
                rootActionId: null,
                actionName: '',
                duration: 0,
                date: Date.create('today'),
                details: '',
                entry: 'performed',
                tags: []
            };
        },

        plan: function (name) {
            // return object literal
            return {
                isNew: true,
                id: hlcommon.uuid(),
                kind: 'Goal',
                name: name || '',
                created: new Date().toISOString(),
                duration: 0,
                tagName: null,
                content: null,
                iconUri: null
            };
        },

        planStep: function (planId, parentId, name) {
            // return object literal
            return {
                isNew: true,
                id: hlcommon.uuid(),
                kind: 'Step',
                name: name || '',
                status: 'Todo',
                created: new Date().toISOString(),
                duration: null,
                content: null,
                tagName: null,
                planId: planId,
                parentId: parentId,
                ordinal: 1
            };
        },

        tag: function (name) {
            return {
                isNew: true,
                id: hlcommon.uuid(),
                kind: 'Tag',
                name: name || '',
                content: null
            };
        },

        target: function (name) {
            // REMEMBER KEYWORD: Timeline

            // return object literal
            var dateIso = new Date().toISOString();

            return {
                isNew: true,
                id: hlcommon.uuid(),
                created: dateIso,
                name: name || '',
                entityType: 'Tag',
                entityId: null,
                measure: null, // BY_EXECUTION = 0, BY_PROGRESS = 1, BY_DURATION = 2
                target: null, /* Depends on measure: BY_EXECUTION - The target number of executions within a single period.
                                                     BY_PROGRESS - The target percentage of progress within a single period.
                                                     BY_DURATION - The target number of minutes spent within a single period. */
                starts: dateIso,
                period: null,
                multiplier: 1,
                number: 1,
                retireWhenMet: false
            };
        },

        /**
         * Parses a tag value string to an object
         */
        parseTag: function (tagValue) {
            var kind = 'Tag';
            var name = tagValue;
            var className = 'fa-tag';

            /**
             * Compare first char of tag to
             * determine if it is a special tag
             */
            var firstChar = name.slice(0,1);
            if (firstChar === TAG_KIND.FOCUS) {
                kind = 'Focus'; // part of
                className = 'fa-eye';
            }
            else if (firstChar === TAG_KIND.PLACE) {
                kind = 'Place'; // where
                className = 'fa-anchor';
            }
            else if (firstChar === TAG_KIND.GOAL) {
                kind = 'Goal'; // to what end
                className = 'fa-trophy';
            }
            else if (firstChar === TAG_KIND.NEED) {
                kind = 'Need'; // why
                className = 'fa-recycle';
            }
            else if (firstChar === TAG_KIND.BOX) {
                kind = 'Box'; // when
                className = 'fa-cube';
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
                value: tagValue,
                kind: kind,
                name: name,
                className: className
            };
        },

        /**
         * Get raw tag value from a tag object
         */
        getTagValue: getTagValue,

        filterChildren: function (nodes, parentId) {
            return those(nodes).like({ parentId: parentId });
        },

        calculateNewPlanStep: function (parentId, planId, planSteps) {
            var steps = this.filterChildren(planSteps || [], parentId);
            var nextOrdinal = 1;
            if (steps.length > 0) {
                steps = _.sortBy(steps, function (item) {
                    return item.ordinal;
                });
                steps.reverse();
                nextOrdinal = steps[0].ordinal + 1;
            }

            return {
                isNew: true,
                id: hlcommon.uuid(),
                planId: planId,
                parentId: parentId,
                name: '+',
                kind: 'Step',
                status: 'Todo',
                created: (new Date()).toISOString(),
                content: null,
                ordinal: nextOrdinal,

            };
        },

        startsWithAVowel: function (word) {
            if (['a','e','i','o','u'].indexOf(word[0].toLowerCase()) > -1) {
                return true;
            }
            else {
                return false;
            }
        },

        hasPossessiveNoun: function (words) {
            if (words.indexOf('\'s ') > 0 || words.indexOf('s\' ') > 0) {
                return true;
            }
            else {
                return false;
            }
        },

        /**
         * Pluralizes a word based on how many
         */
        formatNoun: function (noun, howMany) {

            if (howMany === 0) {
                return 'no ' + plural(noun);
            }
            else if (howMany === 1) {
                return noun;
            }
            else {
                return plural(noun);
            }
        },

        calcNaturalDays: function (date) {
            if (!date) {
                return '';
            }
            var date1 = date;
            var date2 = new Date();

            date1.setHours(0,0,0,0);
            date2.setHours(0,0,0,0);

            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // milliseconds in a second * seconds in an hour * hours in a day

            if (date1 < date2) {
                if (diffDays === 0) {
                    return 'Today';
                }
                else if (diffDays === 1) {
                    return 'Yesterday';
                }
                else if (diffDays < 7) {
                    return babble.moments.daysOfWeek[date1.getDay()];
                }
                else {
                    return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
                }
            }
            else if (diffDays === 0) {
                return 'Today';
            }
            else if (diffDays === 1) {
                return 'Tomorrow';
            }
            else if (diffDays < 7) {
                return babble.moments.daysOfWeek[date1.getDay()];
            }
            else {
                return 'in ' + diffDays + ' day' + (diffDays > 1 ? 's' : '');
            }
        }
    };

}));
