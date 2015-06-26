// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('react')
        );
    }
    else if (typeof define === "function" && define.amd) {
        // AMD
        define([
            'react'
        ], factory);
    }
    else {
        // Global (browser)
        window.ManageTargets = factory(window.React);
    }
}(function (React) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                targetsLastUpdated: (new Date()).toISOString()  
            };
        },
        
        componentWillMount: function () {
            /**
             * Subscribe to Target Store to be 
             * notified of updates to the store
             */
            this.targetsObserver = targetStore.updates
                .subscribe(this.handleTargetStoreUpdate);
            
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            this.targetsObserver.dispose();
        },

        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            ui.goBack();
        },
        handleTargetClick: function (target) {
            ui.goTo('Manage Target', {targetId: target.id});
        },
        handleTargetStoreUpdate: function (targets) {
            this.setState({ targetsLastUpdated: (new Date()).toISOString() });
        },
        
        /*************************************************************
         * CALCULATIONS
         *************************************************************/
        calcColor: function (percent) {
            if (typeof percent === 'undefined' || percent === '') {
                return null;
            }
            
            var multiplier = 120 / 100;
            var offBy = 100 - percent;
            
            var color = 'hsl(' + (120 - Math.round(offBy * multiplier)) + ',90%,40%)';
            var suffix = '%';
            
            return color;
        },
        
        calcProgressProps: function (target, stats) {
            var progress = {
                kind: 'comparison',
                value: stats.periodActive.number,
                backgroundColor: 'white',
                compare: target.number,
                change: stats.periodActive.number > target.number ? stats.periodActive.number - target.number : 0
            };

            var diff = target.number - stats.periodActive.number;
            var expectedRate = target.number / stats.periodActive.daysInPeriod;
            if (diff <= 0) {
                Object.assign(progress, {
                    kind: 'simple',
                    backgroundColor: this.calcColor(100),
                    value: "MET",
                    compare: null
                });
            } else if (Math.ceil(stats.periodActive.daysLeft * expectedRate) >= diff) {
                // do nothing
            } else {
                Object.assign(progress, {
                    backgroundColor: this.calcColor(Math.round((Math.ceil(stats.periodActive.daysLeft * expectedRate) / diff) * 100) - 50)
                });
            }
            
            return progress;
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var targets = targetStore.updates.value.slice();
            
            /**
             * Sort the actions by completed and name
             */
            targets = _.sortBy(targets, function(target){ 
                return target.name.toLowerCase();
            })
            
            
            /**
             * Add 'New Target' to list
             */
            targets.push(doozy.target());
            
            /**
             * Inline Styles
             */
            var headerStyle = {
                display: 'flex',
                flexDirection: 'row',
                color: '#e2ff63', 
                backgroundColor: '#444', 
                padding: '2px 2px 0 8px',
                fontWeight: 'bold',
                fontSize: '1.5em'
            };
        
            var targetStyle = {
                fontSize: 'large',
                padding: '5px',
                borderBottom: 'solid 1px #e0e0e0'
            };
            
            var targetsStats = doozy.targetsStats();
            
            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Targets</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>                    
                        {targets.map(function(item, index) {
                            
                            // find statistics object for this target
                            var stats = _.find(targetsStats, function (s) { return s.targetId === item.id});
                
                            if (typeof stats === 'undefined') {
                                // new target has no stats
                                return (
                                    <div key={item.id} className="clickable" style={targetStyle} onClick={this.handleTargetClick.bind(null, item)}>
                                        <div>{item.name}</div>
                                    </div>
                                );
                            } else {
                                
                                var progress = this.calcProgressProps(item, stats);
                                
                                var streak = {
                                    backgroundColor: stats.periodActive.streak >= stats.periodLongestStreak.streak ? 'hsl(120,90%,40%)' : (stats.periodActive.streak === 0 ? 'hsl(0,90%,40%)' : 'white'),
                                    change: stats.periodActive.streak > stats.periodLongestStreak.streak ? stats.periodActive.streak - stats.periodLongestStreak.streak : 0
                                }
                                
                                var timeTo = new Date(stats.periodActive.ends);
                                timeTo.setHours(23,59,59,999);
                                var timeLeft = new babble.Duration(timeTo - (new Date()).getTime()).toString().split(', ')[0] + ' left in this period';
                                
                                // existing targets
                                return (
                                    <div key={item.id} className="clickable" style={targetStyle} onClick={this.handleTargetClick.bind(null, item)}>
                                        <div style={{width: '100%', fontSize: 'x-large'}}>{item.name}</div>
                                        <div style={{display: 'flex'}}>
                                            <Indicator kind={progress.kind} title={'Progress'} 
                                                    backgroundColor={progress.backgroundColor} 
                                                    value={progress.value} 
                                                    compareValue={progress.compare} 
                                                    change={progress.change} />
                                            <Indicator kind={'comparison'} title={'Streak'} 
                                                    backgroundColor={streak.backgroundColor} 
                                                    value={stats.periodActive.streak} 
                                                    compareValue={stats.periodLongestStreak.streak} 
                                                    change={streak.change} />
                                            <Indicator kind={'percent'} title={'Accuracy'} 
                                                    backgroundColor={this.calcColor(stats.accuracy)} 
                                                    value={stats.accuracy} 
                                                    change={stats.change} />
                                        </div>
                                        <div style={{textAlign: 'right'}}>{timeLeft}</div>
                                    </div>
                                );
                            }
                        }.bind(this))}
                    </div>  
                </div>
            );
        }
    });
 }));