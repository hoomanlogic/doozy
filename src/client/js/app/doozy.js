// CommonJS, AMD, and Global shim
(function (root, factory) {
    'use strict';

	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(
            require('common'),
            require('errl'),
            require('toastr')
        );
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([
            './common',
            './errl',
            './toastr'
        ], factory);
	}
	else {
		// Global (browser)
		root.doozy = factory(root.hlcommon, root.errl, root.toastr);
	}
}(this, function (hlcommon, errl, toastr) {
    'use strict';
    
    /**
     * Configure error logger
     */
    errl.config = errl.config || {};
    Object.assign(errl.config, {
        developer: 'hoomanlogic',
        key: '54263eb4-6ced-49bf-9bd7-14f0106c2a02',
        product: 'HoomanLogic',
        environment: null,
        getState: null,
        getUser: function () {
            return 'anonymous';
        },
        onLogged: function (err) {
            toastr.error("<p><string>Oops!</strong></p><p>We're really sorry about that.</p><p>We'll get this fixed as soon as possible.</p>" + '<a class="btn btn-default btn-link" target="_blank" href="' + errl.getErrorDetailUrl(err.errorId) + '">Show me details</a> ');
        }
    });
    
    /**
     * Configure toastr notifications
     */
    toastr.options.closeButton = true;
    toastr.options.timeOut = 2000;
    toastr.options.positionClass = 'toast-bottom-right';

    
	
    var getFrequencyNoun = function (freq) {
        freq = freq.slice(0,1).toLowerCase();
        if (freq === 'w') {
            return 'Week';   
        } else if (freq === 'm') {
            return 'Month';   
        } else if (freq === 'y') {
            return 'Year';   
        } else if (freq === 'd') {
            return 'Day';   
        }
    };

    var TAG_PREFIX = {
        FOCUS: '!',
        PLACE: '@',
        GOAL: '>',
        NEED: '$',
        BOX: '#',
        TAG: ''
    };
    
    var TARGET_PERIOD = {
        YEARS: 0,
        MONTHS: 1,
        WEEKS: 2,
        DAYS: 3
    };

    var TARGET_MEASURE = {
        EXECUTION: 0,
        PROGRESS: 1,
        DURATION: 2
    };
    
    var nextTargetPeriod = function (target, d) {
        if (target.period === TARGET_PERIOD.YEARS) {
            d.setFullYear(d.getFullYear() + target.multiplier);
        } else if (target.period === TARGET_PERIOD.MONTHS) {
            d.setMonth(d.getMonth() + target.multiplier);   
        } else if (target.period === TARGET_PERIOD.WEEKS) {
            d.setDate(d.getDate() + (target.multiplier * 7));   
        } else if (target.period === TARGET_PERIOD.DAYS) {
            d.setDate(d.getDate() + target.multiplier);   
        }
    };
    
    var targetPeriodEnds = function (target, start) {
        var d = new Date(start.toISOString());
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
    
    var targetPeriodStats = function (target, periodStarts, periodEnds, prevPeriodStats, isActive) {
        var number, performed, streak;
        
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
        } else {
            streak = 0;
        }
        
        // return period stats
        return {
            starts: periodStarts.toISOString(),
            ends: periodEnds.toISOString(),
            number: number,
            met: target.number <= number,
            streak: streak,
            distance: number - target.number,
            logEntries: performed
        };
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
    
    return {
        /**
         * Configure host name
         */
        HOST_NAME: window.location.href.split('/').slice(0, 3).join('/'),
        TAG_PREFIX: TAG_PREFIX,
        TARGET_PERIOD: TARGET_PERIOD,
        TARGET_MEASURE: TARGET_MEASURE,
        getFrequencyNoun: getFrequencyNoun,
        getRecurrenceObj: getRecurrenceObj,
        getRecurrenceSummary: function (recurrenceRules) {
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
                    var fullnameDays = babble.moments.daysOfWeek.filter(function(item) {
                        return twoCharDays.indexOf(item.slice(0,2).toUpperCase()) > -1;
                    });

                    if (recurrenceObj.interval > 1) {
                        if (days.SU && days.SA && !days.MO && !days.TU && !days.WE && !days.TH && !days.FR) {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq).toLowerCase() + ' on the weekend';
                        } else if (!days.SU && !days.SA && days.MO && days.TU && days.WE && days.TH && days.FR) {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq).toLowerCase() + ' on the weekdays';
                        } else {
                            summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq).toLowerCase() + ' on ' + fullnameDays.join(', ');
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
                        summary = 'Every ' + recurrenceObj.interval + ' ' + getFrequencyNoun(recurrenceObj.freq).toLowerCase() + 's';
                    } else {
                        summary = 'Every ' + getFrequencyNoun(recurrenceObj.freq).toLowerCase();
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
                tagName: null,
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

        targetStatistics: function () {

            var targetStatistics = [];

            targetStore.updates.value.forEach( function (target) {

                var periodsStats = [];

                var actionIds = [];
                if (target.entityType === 'Tag') {
                    var tag = tagStore.getTagById(target.entityId);
                    var actions = actionStore.updates.value.filter(function (item) {
                        return item.tags.indexOf((TAG_PREFIX[tag.kind.toUpperCase()] + tag.name)) !== -1;
                    });
                    actions.forEach(function (item) {
                        actionIds.push(item.id);
                    });
                } else if (target.entityType === 'Action') {
                    actionIds.push(target.entityId);
                }

                var activePeriod;

                var periodStarts = new Date(target.starts);
                periodStarts.setHours(0,0,0,0);

                var today = new Date();
                today.setHours(0,0,0,0);

                while (periodStarts <= today) {

                    var periodEnds = targetPeriodEnds(target, periodStarts);
                    var prevPeriodStats = periodsStats.length > 0 ? periodsStats[periodsStats.length - 1] : null;

                    if (ends < today) {
                        // add period tally
                        periodsStats.push(
                            targetPeriodStats(target, 
                                              periodStarts, 
                                              periodEnds, 
                                              prevPeriodStats,
                                              false)
                        );
                    } else {
                        activePeriod = targetPeriodStats(target, 
                                                         periodStarts, 
                                                         periodEnds, 
                                                         prevPeriodStats,
                                                         true);
                    }

                    // step to next target period
                    nextTargetPeriod(target, periodStarts);

                }

                var change = 0,
                    accuracy = Math.round((periodsStats.filter(function (item) { return item.met; }).length / periodsStats.length) * 10000) / 100;

                if (periodsStats.length > 1) {
                    var allButLatestPeriod = periodsStats.slice(0, -1);
                    var accuracyBeforeLatestPeriod = Math.round((allButLatestPeriod.filter(function (item) { return item.met; }).length / allButLatestPeriod.length) * 10000) / 100;
                    change = Math.round((accuracy - accuracyBeforeLatestPeriod) * 100) / 100;
                }

                var longestStreakPeriod = _.max(periodsStats, 'streak');

                targetStatistics.push({
                    targetId: target.id,
                    periodActive: activePeriod,
                    periodLongestStreak: longestStreakPeriod,
                    periods: periodsStats,
                    accuracy: accuracy,
                    change: change,
                });
            });

            return targetStatistics;
        },
        
        /**
         * Parses a tag string to an object
         */
        parseTag: function (tag) {
            var kind = 'Tag',
                name = tag,
                className = 'fa-tag';

            /**
             * Compare first char of tag to
             * determine if it is a special tag
             */
            var firstChar = name.slice(0,1);
            if (firstChar === TAG_PREFIX.FOCUS) {
                kind = 'Focus'; // part of
                className = 'fa-eye';
            } else if (firstChar === TAG_PREFIX.PLACE) {
                kind = 'Place'; // where
                className = 'fa-anchor';
            } else if (firstChar === TAG_PREFIX.GOAL) {
                kind = 'Goal'; // to what end
                className = 'fa-trophy';
            } else if (firstChar === TAG_PREFIX.NEED) {
                kind = 'Need'; // why
                className = 'fa-recycle';
            } else if (firstChar === TAG_PREFIX.BOX) {
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
                value: tag,
                kind: kind,
                name: name,
                className: className
            };
        },

        startsWithAVowel: function (word) {
            if (['a','e','i','o','u'].contains(word[0].toLowerCase())) {
                return true;
            } else {
                return false;
            }
        },

        hasPossessiveNoun: function (words) {
            if (words.indexOf('\'s ') > 0) {
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
            }

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

        // Data access operations
        setAccessToken: function (accessToken) {
            sessionStorage.setItem('accessToken', accessToken);
        },

        getAccessToken: function () {
            return sessionStorage.getItem('accessToken');
        },
    };
	
}));