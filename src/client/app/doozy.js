(function (factory) {
    module.exports = exports = factory(
        require('hl-common-js/src/common'),
        require('../stores/ActionStore'),
        require('../stores/LogEntryStore'),
        require('../stores/TagStore'),
        require('../stores/TargetStore'),
        require('babble')
    );
}(function (hlcommon, actionStore, logEntryStore, tagStore, targetStore, babble) {

    var TAG_KIND = {
        FOCUS: '!',
        PLACE: '@',
        GOAL: '>',
        NEED: '$',
        BOX: '#',
        TAG: ''
    };

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

    var nextTargetPeriod = function (target, starts) {
        if (target.period === TARGET_PERIOD.YEARS) {
            starts.setFullYear(starts.getFullYear() + target.multiplier);
        } else if (target.period === TARGET_PERIOD.MONTHS) {
            starts.setMonth(starts.getMonth() + target.multiplier);
        } else if (target.period === TARGET_PERIOD.WEEKS) {
            starts.setDate(starts.getDate() + (target.multiplier * 7));
        } else if (target.period === TARGET_PERIOD.DAYS) {
            starts.setDate(starts.getDate() + target.multiplier);
        }
    };

    var targetPeriodEnds = function (target, starts) {
        var d = new Date(starts.toISOString());
        if (target.period === TARGET_PERIOD.YEARS) {
            d.setFullYear(d.getFullYear() + target.multiplier);
        } else if (target.period === TARGET_PERIOD.MONTHS) {
            d.setMonth(d.getMonth() + target.multiplier);
        } else if (target.period === TARGET_PERIOD.WEEKS) {
            d.setDate(d.getDate() + (target.multiplier * 7));
        } else if (target.period === TARGET_PERIOD.DAYS) {
            d.setDate(d.getDate() + target.multiplier);
        }
        d.setDate(d.getDate() - 1);
        return d;
    };

    var targetPeriodStats = function (target, actionIds, periodStarts, periodEnds, prevPeriodStats, isActive) {
        var number, performed, streak = 0;

        // get performed log entries relevant to the target period
        performed = logEntryStore.updates.value.filter(function (item) {
            var logDate = new Date(item.date);
            return item.entry === 'performed' &&
                actionIds.indexOf(item.actionId) !== -1 &&
                logDate >= periodStarts &&
                logDate <= periodEnds;
        });

        // calculate number based on log history
        if (target.measure === TARGET_MEASURE.EXECUTION) {
            number = performed.length;
        } else if (target.measure === TARGET_MEASURE.DURATION) {
            performed.forEach(function (item) {
                number += item.duration;
            });
        }

        // calculate period streak
        if (target.number <= number) { // is target met?
            if (typeof prevPeriodStats !== 'undefined' && prevPeriodStats !== null) {
                streak = prevPeriodStats.streak + 1;
            } else {
                streak += 1;
            }
        } else if (isActive && typeof prevPeriodStats !== 'undefined' && prevPeriodStats !== null) {
            streak = prevPeriodStats.streak;
        }

        // for current period, a few more indicators
        if (isActive) {
            var daysInPeriod = (periodEnds.getTime() - periodStarts.getTime()) / 86400000;
            var today = new Date();
            today.setHours(0,0,0,0);

            if (periodEnds.getTime() === today.getTime()) {
                var daysLeft = ((new Date()).getTime() - periodEnds.getTime()) / (86400000 * 0.7);
            } else {
                var daysLeft = (periodEnds.getTime() - today.getTime()) / 86400000;
            }

        }

        // return period stats
        return {
            starts: periodStarts.toISOString(),
            ends: periodEnds.toISOString(),
            number: number,
            met: target.number <= number,
            streak: streak,
            distance: number - target.number,
            logEntries: performed,
            daysLeft: daysLeft,
            daysInPeriod: daysInPeriod
        };
    };

    return {

        TAG_KIND: TAG_KIND,

        TARGET_MEASURE: TARGET_MEASURE,

        TARGET_PERIOD: TARGET_PERIOD,

        getFrequencyName: getFrequencyName,

        parseRecurrenceRule: parseRecurrenceRule,

        getRecurrenceSummary: function (recurrenceRules) {
            if (!recurrenceRules || recurrenceRules.length === 0) {
                return null;
            }

            var summary = '';
            recurrenceRules.forEach(function(item, index, array) {
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
                    for (var i = 0; i < recurrenceObj.byday.length; i++) {
                        days[recurrenceObj.byday[i].day] = true;
                    }

                    var twoCharDays = _.pluck(recurrenceObj.byday, 'day');
                    var fullnameDays = babble.moments.daysOfWeek.filter(function(item) {
                        return twoCharDays.indexOf(item.slice(0,2).toUpperCase()) > -1;
                    });

                    if (recurrenceObj.interval > 1) {
                        if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on the weekend';
                        } else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on the weekdays';
                        } else {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + ' on ' + fullnameDays.join(', ');
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
                        summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyName(recurrenceObj.freq).toLowerCase() + 's';
                    } else {
                        summary = 'Every ' + getFrequencyName(recurrenceObj.freq).toLowerCase();
                    }

                }
            });

            return summary;
        },

        action: function (name, tags) {

            // add tags any were supplied
            var t = [];
            if (typeof tags !== 'undefined') {
                if (typeof tags === 'string') {
                    t.push(tags);
                } else if (Object.prototype.toString.call(tags) === '[object Array]') {
                    t = tags;
                }
            }

            // return object literal
            return {
                id: hlcommon.uuid(),
                kind: 'Action',
                name: name || '',
                created: new Date().toISOString(),
                duration: 0,
                content: null,
                nextDate: null,
                isPublic: false,
                lastPerformed: null,
                tags: t,
                recurrenceRules: [],
                items: []
            };
        },

        plan: function (name) {
            // return object literal
            return {
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

        planStep: function (planId) {
            // return object literal
            return {
                id: hlcommon.uuid(),
                kind: 'Step',
                name:'',
                created: new Date().toISOString(),
                duration: 0,
                content: null,
                tagName: null,
                level: null,
                parent: null,
                ordinal: null
            };
        },

        target: function () {
            //REMEMBER KEYWORD: Timeline

            // return object literal
            var dateIso = new Date().toISOString();

            return {
                isNew: true,
                id: hlcommon.uuid(),
                created: dateIso,
                name: 'New Target',
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

        targetsStats: function (targetId, today) {
            var targets,
                targetsStats = [];

            if (typeof targetId === 'undefined' || targetId === null) {
                targets = [].concat(targetStore.updates.value);
            } else {
                targets = _.find(targetStore.updates.value, function (target) {
                    return target.id === targetId;
                });
                targets = [targets];
            }

            if (!today) {
                today = new Date();
            }

            targets.forEach( function (target) {

                var accuracy,
                    accuracyBeforeLatestPeriod,
                    actionIds = [],
                    activePeriod,
                    allButLatestPeriod,
                    average,
                    change = 0,
                    longestStreakPeriod,
                    periodStarts,
                    periodsStats = [];

                // today


                today.setHours(0,0,0,0);

                // first period starts
                periodStarts = new Date(target.starts);
                periodStarts.setHours(0,0,0,0);

                if (today <= periodStarts) {
                    targetsStats.push({
                        targetId: target.id,
                        error: 'Today is before Period Starts'
                    });
                    return;
                }

                // populate array of action ids related to this target
                if (target.entityType === 'Tag') {
                    var tag = tagStore.getTagById(target.entityId);
                    var actions = actionStore.updates.value.filter(function (item) {
                        return item.tags.indexOf((TAG_KIND[tag.kind.toUpperCase()] + tag.name)) !== -1;
                    });
                    actions.forEach(function (item) {
                        actionIds.push(item.id);
                    });
                } else if (target.entityType === 'Action') {
                    actionIds.push(target.entityId);
                }

                // steps through all periods for this target
                while (periodStarts <= today) {

                    var periodEnds = targetPeriodEnds(target, periodStarts);
                    var prevPeriodStats = periodsStats.length > 0 ? periodsStats[periodsStats.length - 1] : null;

                    if (periodEnds < today) {
                        // add period tally
                        periodsStats.push(
                            targetPeriodStats(target,
                                              actionIds,
                                              periodStarts,
                                              periodEnds,
                                              prevPeriodStats,
                                              false)
                        );
                    } else {
                        activePeriod = targetPeriodStats(target,
                                                         actionIds,
                                                         periodStarts,
                                                         periodEnds,
                                                         prevPeriodStats,
                                                         true);
                    }

                    // step to next target period
                    nextTargetPeriod(target, periodStarts);

                }

                // calculate accuracy
                accuracy = Math.round((periodsStats.filter(function (item) { return item.met; }).length / periodsStats.length) * 10000) / 100;

                if (periodsStats.length === 1) {
                    average = periodsStats[0].number;
                } else {
                    average = 0;
                    periodsStats.forEach( function (item) {
                       average += item.number;
                    });
                    average = average / periodsStats.length;
                    average = Math.round(average * 100) / 100;
                }

                if (periodsStats.length > 1) {
                    allButLatestPeriod = periodsStats.slice(0, -1);
                    accuracyBeforeLatestPeriod = Math.round((allButLatestPeriod.filter(function (item) { return item.met; }).length / allButLatestPeriod.length) * 10000) / 100;
                    change = Math.round((accuracy - accuracyBeforeLatestPeriod) * 100) / 100;
                }

                longestStreakPeriod = _.max(periodsStats, 'streak');

                targetsStats.push({
                    targetId: target.id,
                    periodActive: activePeriod,
                    periodLongestStreak: longestStreakPeriod,
                    periods: periodsStats,
                    accuracy: accuracy,
                    change: change,
                    average: average
                });
            });

            return targetsStats;
        },

        /**
         * Parses a tag value string to an object
         */
        parseTag: function (tagValue) {
            var kind = 'Tag',
                name = tagValue,
                className = 'fa-tag';

            /**
             * Compare first char of tag to
             * determine if it is a special tag
             */
            var firstChar = name.slice(0,1);
            if (firstChar === TAG_KIND.FOCUS) {
                kind = 'Focus'; // part of
                className = 'fa-eye';
            } else if (firstChar === TAG_KIND.PLACE) {
                kind = 'Place'; // where
                className = 'fa-anchor';
            } else if (firstChar === TAG_KIND.GOAL) {
                kind = 'Goal'; // to what end
                className = 'fa-trophy';
            } else if (firstChar === TAG_KIND.NEED) {
                kind = 'Need'; // why
                className = 'fa-recycle';
            } else if (firstChar === TAG_KIND.BOX) {
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
        getTagValue: function (tag) {
            return TAG_KIND[tag.kind.toUpperCase()] + tag.name;
        },

        startsWithAVowel: function (word) {
            if (['a','e','i','o','u'].contains(word[0].toLowerCase())) {
                return true;
            } else {
                return false;
            }
        },

        hasPossessiveNoun: function (words) {
            if (words.indexOf('\'s ') > 0 || words.indexOf('s\' ') > 0) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * Pluralizes a word based on how many
         */
        formatNoun: function (noun, howMany) {

            var plural = function (noun) {
                var vowels = ['a','e','i','o','u'];
                if (noun[noun.length - 1] === 'y' && vowels.indexOf(noun[noun.length - 2].toLowerCase()) === -1) {
                    return noun.substring(0, noun.length - 1) + 'ies';
                } else {
                    return noun + 's';
                }
            };

            if (howMany === 0) {
                return 'no ' + plural(noun);
            } else if (howMany === 1) {
                return noun;
            } else {
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
                } else if (diffDays === 1) {
                    return 'Yesterday';
                } else if (diffDays < 7) {
                    return babble.moments.daysOfWeek[date1.getDay()];
                } else {
                    return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
                }
            } else {
                if (diffDays === 0) {
                    return 'Today';
                } else if (diffDays === 1) {
                    return 'Tomorrow';
                } else if (diffDays < 7) {
                    return babble.moments.daysOfWeek[date1.getDay()];
                } else {
                    return 'in ' + diffDays + ' day' + (diffDays > 1 ? 's' : '');
                }
            }
        },
    };

}));
