/**
 * 2015, HoomanLogic, Geoff Manning
 * Namespace: hlapp
 * Dependencies: toastr
 */
 
if (typeof require !== 'undefined') {
	var errl = require('errl');
	var hlcommon = require('common');
	var skycons = require('skycons');
	var jstorage = require('jstorage');
	var aes = require('aes');
	var signalr = require('signalr');
	var selectize = require('selectize');
	var toastr = require('toastr');
}

(function (exports) {
    'use strict';
	
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
        BOX: '#'
    }
    
    exports.TAG_PREFIX = TAG_PREFIX;
    exports.getFrequencyNoun = getFrequencyNoun;

    exports.getComparableLocalDateString = function (jsonDate) {
        var date = new Date(jsonDate);
        var year = String(date.getYear() + 1900);
        var month = String(date.getMonth() + 1);
        var day = String(date.getDate());
        if (month.length === 1) {
            month = '0' + month;   
        }
        if (day.length === 1) {
            day = '0' + day;   
        }
        return year + '-' + month + '-' + day;
    };

    /**
     * Parses a tag string to an object
     */
    exports.parseTag = function (tag) {
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
    };

    exports.startsWithAVowel = function (word) {
        if (['a','e','i','o','u'].contains(word[0].toLowerCase())) {
            return true;
        } else {
            return false;
        }
    };

    exports.hasPossessiveNoun = function (words) {
        if (words.indexOf('\'s ') > 0) {
            return true;
        } else {
            return false;
        }
    };
    
    /**
     * Pluralizes a word based on how many
     */
    exports.formatNoun = function (noun, howMany) {

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
    };
    
    exports.calcNaturalDays = function (date) {
        if (!date) {
            return '';   
        }
        var date1 = new Date(date.toLocaleDateString());
        var date2 = new Date((new Date()).toLocaleDateString());
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
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
    };
    
    // Data access operations
    exports.setAccessToken = function (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
    };
	
    exports.getAccessToken = function () {
        return sessionStorage.getItem('accessToken');
    };
    
    // Actions
    exports.action = function (name, tags) {

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
            ref: hlcommon.uuid(),
            id: this.ref,
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
    };    

    exports.filterActions = function (actions, tags, type) {
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
        }  else if (type === 'not') {
            return actions.filter(function (item) { return _.intersection(tags, item.tags).length === 0; });
        }
    };

    exports.getRecurrenceObj = function (item) {

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

    exports.getRecurrenceSummary = function (recurrenceRules) {
        if (!recurrenceRules || recurrenceRules.length === 0) {
            return null;   
        }

        var summary = '';
        recurrenceRules.forEach(function(item, index, array) {
            var recurrenceObj = exports.getRecurrenceObj(item);


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
    };
    
    // configure error logger
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
    
    // configure toastr notifications
    toastr.options.closeButton = true;
    toastr.options.timeOut = 2000;
    toastr.options.positionClass = 'toast-bottom-right';

    // configure host name
    exports.HOST_NAME = window.location.href.split('/').slice(0, 3).join('/');
	
}(typeof exports === 'undefined' ? this['hlapp'] = {}: exports));