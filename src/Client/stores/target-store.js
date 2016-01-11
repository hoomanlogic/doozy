(function (factory) {
    module.exports = exports = factory(
        require('stores/gnode-store'),
        require('stores/logentry-store'),
        require('stores/tag-store'),
        require('app/doozy'),
        require('hl-common-js/src/those')
    );
}(function (gnodeStore, logEntryStore, tagStore, doozy, those) {
    // Create an entity store for sites and register it with the entity hub notifications api
    var targetStore = new gnodeStore.GnodeStore('Target');
    // TODO: Move all this target period processing to the server-side
    var nextTargetPeriod = function (target, starts) {
        if (target.period === doozy.TARGET_PERIOD.YEARS) {
            starts.setFullYear(starts.getFullYear() + target.multiplier);
        }
        else if (target.period === doozy.TARGET_PERIOD.MONTHS) {
            starts.setMonth(starts.getMonth() + target.multiplier);
        }
        else if (target.period === doozy.TARGET_PERIOD.WEEKS) {
            starts.setDate(starts.getDate() + (target.multiplier * 7));
        }
        else if (target.period === doozy.TARGET_PERIOD.DAYS) {
            starts.setDate(starts.getDate() + target.multiplier);
        }
    };

    var targetPeriodEnds = function (target, starts) {
        var d = new Date(starts.toISOString());
        if (target.period === doozy.TARGET_PERIOD.YEARS) {
            d.setFullYear(d.getFullYear() + target.multiplier);
        }
        else if (target.period === doozy.TARGET_PERIOD.MONTHS) {
            d.setMonth(d.getMonth() + target.multiplier);
        }
        else if (target.period === doozy.TARGET_PERIOD.WEEKS) {
            d.setDate(d.getDate() + (target.multiplier * 7));
        }
        else if (target.period === doozy.TARGET_PERIOD.DAYS) {
            d.setDate(d.getDate() + target.multiplier);
        }
        d.setDate(d.getDate() - 1);
        d.setHours(23, 59, 59, 999);
        return d;
    };

    this.targetsStats = function (targetId, today) {
        var targets;
        var targetsStats = [];

        if (typeof targetId === 'undefined' || targetId === null) {
            targets = those(targetStore.context({}).value).copy();
        }
        else {
            targets = those(targetStore.context({}).value).first({ id: targetId });
            targets = [targets];
        }

        // today
        /* eslint-disable no-param-reassign */
        if (!today) {
            today = new Date();
        }
        today.setHours(0,0,0,0);
        /* eslint-enable no-param-reassign */

        targets.forEach( function (target) {

            var accuracy,
                accuracyBeforeLatestPeriod,
                activePeriod,
                allButLatestPeriod,
                average,
                longestStreakPeriod,
                periodStarts;

            // var actionIds = [];
            var change = 0;
            var periodsStats = [];

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
            // if (target.entityType === 'Tag') {
            //    var tag = tagStore.getTagById(target.entityId);
            //    var actions = actionStore.updates.value.filter(function (item) {
            //        return item.tags.indexOf((TAG_KIND[tag.kind.toUpperCase()] + tag.name)) !== -1;
            //    });
            //    actions.forEach(function (item) {
            //        actionIds.push(item.id);
            //    });
            // } else if (target.entityType === 'Action') {
            //    actionIds.push(target.entityId);
            // }

            // steps through all periods for this target
            while (periodStarts <= today) {

                var periodEnds = targetPeriodEnds(target, periodStarts);
                var prevPeriodStats = periodsStats.length > 0 ? periodsStats[periodsStats.length - 1] : null;

                if (periodEnds < today) {
                    // add period tally
                    periodsStats.push(
                        targetPeriodStats(target,
                                            periodStarts,
                                            periodEnds,
                                            prevPeriodStats,
                                            false)
                    );
                }
                else {
                    activePeriod = targetPeriodStats(target,
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
            }
            else {
                average = 0;
                periodsStats.forEach( function (item) {
                    average += item.number;
                });
                average /= periodsStats.length;
                average = Math.round(average * 100) / 100;
            }

            if (periodsStats.length > 1) {
                allButLatestPeriod = periodsStats.slice(0, -1);
                accuracyBeforeLatestPeriod = Math.round((allButLatestPeriod.filter(function (item) { return item.met; }).length / allButLatestPeriod.length) * 10000) / 100;
                change = Math.round((accuracy - accuracyBeforeLatestPeriod) * 100) / 100;
            }

            longestStreakPeriod = those(periodsStats).max('streak');

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
    };

    var targetPeriodStats = function (target, periodStarts, periodEnds, prevPeriodStats, isActive) {
        var daysLeft, daysInPeriod, number, performed, tag, today;
        var streak = 0;

        // get performed log entries relevant to the target period
        if (target.entityType === 'Tag') {
            var tagModel = tagStore.get(target.entityId);
            if (tagModel) {
                tag = doozy.getTagValue(tagModel);
            }
        }
        //
        var ctxLogEntries = logEntryStore.context({});
        if (!ctxLogEntries || !ctxLogEntries.value) {
            return null;
        }

        performed = logEntryStore.context({}).value.filter(function (item) {
            var logDate = new Date(item.date);

            if (item.entry !== 'performed' || logDate < periodStarts || logDate > periodEnds) {
                return false;
            }

            if (target.entityType === 'Action') {
                return target.entityId === item.actionId;
            }
            else if (target.entityType === 'Tag') {
                return item.tags.indexOf(tag) !== -1;
            }
        });

        // calculate number based on log history
        if (target.measure === doozy.TARGET_MEASURE.EXECUTION) {
            number = performed.length;
        }
        else if (target.measure === doozy.TARGET_MEASURE.DURATION) {
            performed.forEach(function (item) {
                number += item.duration;
            });
        }

        // calculate period streak
        if (target.number <= number) { // is target met?
            if (typeof prevPeriodStats !== 'undefined' && prevPeriodStats !== null) {
                streak = prevPeriodStats.streak + 1;
            }
            else {
                streak += 1;
            }
        }
        else if (isActive && typeof prevPeriodStats !== 'undefined' && prevPeriodStats !== null) {
            streak = prevPeriodStats.streak;
        }

        // for current period, a few more indicators
        if (isActive) {
            today = new Date();
            daysInPeriod = (periodEnds.getTime() - periodStarts.getTime()) / 86400000;
            today.setHours(0,0,0,0);

            if (periodEnds.getTime() === today.getTime()) {
                daysLeft = ((new Date()).getTime() - periodEnds.getTime()) / (86400000 * 0.7);
            }
            else {
                daysLeft = (periodEnds.getTime() - today.getTime()) / 86400000;
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

    // Export instance
    return targetStore;
}));
