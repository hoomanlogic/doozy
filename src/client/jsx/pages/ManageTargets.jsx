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
         * RENDERING
         *************************************************************/
        renderPercentChange: function (percent) {
            if (typeof percent === 'undefined' || percent === '') {
                return null;
            }
            
            var color = 'rgb(68,68,68)';
            var prefix = '';
            var suffix = '%';
            if (percent < 0) {
                prefix = ''
                color = 'hsl(0,90%,40%)';
            } else if (percent > 0) {
                prefix = '+'
                color = 'hsl(120,90%,40%)';
            } else {
                prefix = '';
                suffix = '';
                percent = '-';
            }
            
            return (
                <span style={{ color: color }}>{prefix + percent + suffix}</span>
            );
        },
        
        renderPercentAccuracy: function (percent) {
            if (typeof percent === 'undefined' || percent === '') {
                return null;
            }
            
            var multiplier = 120 / 100;
            
            var offBy = 100 - percent;
            
            //hsl(120,90%,40%)
            
            var color = 'hsl(' + (120 - Math.round(offBy * multiplier)) + ',90%,40%)';
            var suffix = '%';
            
            return (
                <span style={{ color: color }}>{percent + suffix}</span>
            );
        },
        
        calcPercentColor: function (percent) {
            if (typeof percent === 'undefined' || percent === '') {
                return null;
            }
            
            var multiplier = 120 / 100;
            var offBy = 100 - percent;
            
            var color = 'hsl(' + (120 - Math.round(offBy * multiplier)) + ',90%,40%)';
            var suffix = '%';
            
            return { 
                backgroundColor: color 
            };
        },
        
        render: function () {

            var targets = targetStore.updates.value.slice();
            
            /**
             * Sort the actions by completed and name
             */
            targets = _.sortBy(targets, function(target){ 
                return target.name.toLowerCase();
            })
            targets.reverse();
            targets.push(doozy.target());
            targets.reverse();
            
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
                                
                                var progressContent = (
                                    <div style={ Object.assign({textAlign: 'center'}, this.calcPercentColor(progressPercent))}>
                                        <div style={{display: 'inline', fontSize: 'x-large'}}>{stats.periodActive.number}</div>
                                        <div style={{display: 'inline'}}>/{item.number}</div>
                                    </div>
                                );
                                var progressPercent = 0;
                                var diff = item.number - stats.periodActive.number;
                                var expectedRate = item.number / stats.periodActive.daysInPeriod;
                                if (diff === 0) {
                                    progressPercent = 100;
                                    progressContent = (
                                        <div style={ Object.assign({textAlign: 'center'}, this.calcPercentColor(progressPercent))}>
                                            <div style={{display: 'inline', fontSize: 'x-large'}}>MET</div>
                                        </div>
                                    );
                                } else if (Math.ceil(stats.periodActive.daysLeft * expectedRate) >= diff) {
                                    progressPercent = 50;
                                    progressContent = (
                                        <div style={ Object.assign({textAlign: 'center'}, this.calcPercentColor(progressPercent))}>
                                            <div style={{display: 'inline', fontSize: 'x-large'}}>{stats.periodActive.number}</div>
                                            <div style={{display: 'inline'}}>/{item.number}</div>
                                        </div>
                                    );
                                } else {
                                    progressPercent = Math.round((Math.ceil(stats.periodActive.daysLeft * expectedRate) / diff) * 100) - 50;
                                    progressContent = (
                                        <div style={ Object.assign({textAlign: 'center'}, this.calcPercentColor(progressPercent))}>
                                            <div style={{display: 'inline', fontSize: 'x-large'}}>{stats.periodActive.number}</div>
                                            <div style={{display: 'inline'}}>/{item.number}</div>
                                        </div>
                                    );
                                }
                                
                                // existing targets
                                return (
                                    <div key={item.id} className="clickable" style={targetStyle} onClick={this.handleTargetClick.bind(null, item)}>
                                        <div style={{width: '100%', fontSize: 'x-large'}}>{item.name}</div>
                                        <div style={{display: 'flex'}}>
                                            <div style={{minWidth: '100px', margin: '5px'}}>
                                                <div style={{textAlign: 'center', borderRadius: '8px 8px 0 0', backgroundColor: 'rgb(68, 68, 68)', color: 'white', marginBottom: '2px'}}>Accuracy</div>
                                                <div style={ Object.assign({textAlign: 'center', color: 'white', fontSize: 'x-large'}, this.calcPercentColor(stats.accuracy))}>{stats.accuracy}%</div>
                                                <div style={{textAlign: 'center', borderRadius: '0 0 8px 8px', backgroundColor: 'rgb(68, 68, 68)', marginTop: '2px'}}>{this.renderPercentChange(stats.change)}</div>
                                            </div>
                                            <div style={{minWidth: '100px', margin: '5px'}}>
                                                <div style={{textAlign: 'center', borderRadius: '8px 8px 0 0', backgroundColor: 'rgb(68, 68, 68)', color: 'white', marginBottom: '2px'}}>Progress</div>
                                                {progressContent}
                                                <div style={{textAlign: 'center', borderRadius: '0 0 8px 8px', backgroundColor: 'rgb(68, 68, 68)', color: 'rgb(68, 68, 68)', marginTop: '2px'}}>0</div>
                                            </div>
                                            <div style={{minWidth: '80px', margin: '5px'}}>
                                                <div style={{textAlign: 'center', borderRadius: '8px 8px 0 0', backgroundColor: 'rgb(68, 68, 68)', color: 'white', marginBottom: '2px'}}>Streak</div>
                                                <div style={{textAlign: 'center'}}>
                                                    <div style={{display: 'inline', fontSize: 'x-large'}}>{stats.periodActive.streak}</div>
                                                    <div style={{display: 'inline'}}>/{stats.periodLongestStreak.streak}</div>
                                                </div>
                                                <div style={{textAlign: 'center', borderRadius: '0 0 8px 8px', backgroundColor: 'rgb(68, 68, 68)', color: 'rgb(68, 68, 68)', marginTop: '2px'}}>0</div>
                                            </div>
                                        </div>
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