(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('lodash'),
        require('babble'),
        require('app/doozy'),
        require('stores/host'),
        require('stores/target-store'),
        require('stores/logentry-store'),
        require('stores/tag-store'),
        require('components/Indicator'),
        require('mixins/SubscriberMixin')
    );
}(function (React, _, babble, doozy, host, targetStore, logEntryStore, tagStore, Indicator, SubscriberMixin) {
    var ManageTargets = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [SubscriberMixin(targetStore)],
        getDefaultProps: function () {
            return {
                globalSubscriberContext: true // SubscriberMixin behavior property
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Targets');
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate, {});
            tagStore.subscribe(this.handleTagStoreUpdate, {});
        },
        componentWillUnmount: function () {
            logEntryStore.unsubscribe(this.handleLogEntryStoreUpdate, {});
            tagStore.unsubscribe(this.handleTagStoreUpdate, {});
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            host.go('/doozy');
        },
        handleEditClick: function (target) {
            host.go('/doozy/target/' + target.id);
        },
        handleTargetClick: function () {
            // ui.goTo('Calendar', {targetId: target.id});
        },
        handleLogEntryStoreUpdate: function () {
            this.setState({
                lastUpdate: new Date().toISOString()
            });
        },
        handleTagStoreUpdate: function () {
            this.setState({
                lastUpdate: new Date().toISOString()
            });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var ctxTargets = targetStore.context({});
            if (!ctxTargets || !ctxTargets.value) {
                return <div>Loading...</div>;
            }

            /**
             * Sort the actions by completed and name
             */
            var targets = _.sortBy(ctxTargets.value, function (target) {
                return target.name.toLowerCase();
            });

            /**
             * Add 'New Target' to list
             */
            targets.push(doozy.target());

            var targetsStats = targetStore.targetsStats();

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Targets</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {targets.map(function (item) {

                            // find statistics object for this target
                            var stats = _.find(targetsStats, function (s) { return s.targetId === item.id; });

                            if (typeof stats === 'undefined') {
                                // new target has no stats
                                return (
                                    <div key={item.id} className="clickable" style={targetStyle} onClick={this.handleEditClick.bind(null, item)}>
                                        <div>{item.name}</div>
                                    </div>
                                );
                            }
                            else {

                                var progress = Indicator.calcProgressProps(item, stats);

                                var streak = {
                                    backgroundColor: stats.periodActive.streak >= stats.periodLongestStreak.streak ? 'hsl(120,90%,40%)' : (stats.periodActive.streak === 0 ? 'hsl(0,90%,40%)' : 'white'),
                                    change: stats.periodActive.streak > stats.periodLongestStreak.streak ? stats.periodActive.streak - stats.periodLongestStreak.streak : 0
                                };

                                var timeTo = new Date(stats.periodActive.ends);
                                timeTo.setHours(23,59,59,999);
                                var timeLeft = new babble.Duration(timeTo - (new Date()).getTime()).toString().split(', ')[0] + ' left in this period';

                                // existing targets
                                return (
                                    <div key={item.id} style={targetStyle}>
                                        <div style={{width: '100%', fontSize: 'x-large'}}>{item.name}</div>
                                        <div style={{display: 'flex'}}>
                                            <Indicator className="clickable" kind={progress.kind} title={'Progress'}
                                                    backgroundColor={progress.backgroundColor}
                                                    value={progress.value}
                                                    compareValue={progress.compare}
                                                    change={progress.change}
                                                    onClick={this.handleTargetClick.bind(null, item)} />
                                            <Indicator className="clickable" kind={'comparison'} title={'Streak'}
                                                    backgroundColor={streak.backgroundColor}
                                                    value={stats.periodActive.streak}
                                                    compareValue={stats.periodLongestStreak.streak}
                                                    change={streak.change}
                                                    onClick={this.handleTargetClick.bind(null, item)} />
                                                <Indicator className="clickable" kind={'percent'} title={'Accuracy'}
                                                    backgroundColor={Indicator.calcColor(stats.accuracy)}
                                                    value={stats.accuracy}
                                                    change={stats.change}
                                                    onClick={this.handleTargetClick.bind(null, item)} />
                                            {/*
                                                <Indicator kind={'simple'} title={'Average'}
                                                        backgroundColor={Indicator.calcColor(stats.accuracy)}
                                                        value={stats.average}
                                                        onClick={this.handleTargetClick.bind(null, item)} />
                                            */}
                                            <div style={{textAlign: 'right'}}>{timeLeft}</div>
                                            <div className="clickable" onClick={this.handleEditClick.bind(null, item)}><i className="fa fa-pencil fa-2x"></i></div>
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

    return ManageTargets;
}));
