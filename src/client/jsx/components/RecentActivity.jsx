// CommonJS, AMD, and Global shim
(function (factory) {
    'use strict';
    if (typeof exports === "object") {
        // CommonJS
        module.exports = exports = factory(
            require('react'),
            require('./LogEntryBox'),
            require('babble/src/durations'),
            require('../../js/stores/LogEntryStore')
        );
    }
    else {
        // Global (browser)
        window.RecentActivity = factory(window.React, window.LogEntryBox, window.babble, window.logEntryStore);
    }
}(function (React, LogEntryBox, babble, logEntryStore) {
    'use strict';
    return React.createClass({
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        getInitialState: function () {
            return {
                maxReturn: 5,
                logEntriesLastUpdated: new Date().toISOString()
            };
        },
        componentWillMount: function () {
            /**
             * Subscribe to Action Store to be
             * notified of updates to the store
             */
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
            var me = this;
            $(window).scroll(function() {
               if ($(window).scrollTop() + $(window).height() == $(document).height()) {
                   me.setState({ maxReturn: me.state.maxReturn + 5});
               }
            });
        },
        componentWillReceiveProps: function (nextProps) {
            if (nextProps.actions &&
                nextProps.actions.length &&
                this.props.actions.length &&
                nextProps.actions[0].tags.length &&
                this.props.actions[0].tags.length &&
                nextProps.actions[0].tags[0] !== this.props.actions[0].tags[0]) {
                this.setState({
                    maxReturn: 5
                });
            }
        },
        componentWillUnmount: function () {
            /**
             * Clean up objects and bindings
             */
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleLogEntryClick: function() {
            ui.logEntry({
                id: '00000000-0000-0000-0000-000000000000'
            });
        },
        handleLogEntryStoreUpdate: function (logEntries) {
            this.setState({logEntriesLastUpdated: new Date().toISOString()});
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var actionIds = _.pluck(this.props.actions, 'id');

            /**
             * Get all distinct tags of all this focus'
             * actions except for the box tags
             */
            var excludePrefixes = ['#'];
            var distinctTags = [];
            this.props.actions.map(function(action) {
                distinctTags = _.union(distinctTags, _.reject(action.tags, function (tag) {
                    return excludePrefixes.indexOf(tag.slice(0,1)) > -1;
                }));
            });

            var logEntries = logEntryStore.updates.value.filter( function (item) {
                return item.entry !== 'created' && (actionIds.indexOf(item.actionId) > -1 || _.intersection(item.tags, distinctTags).length > 0);
            });

            logEntries = _.sortBy(logEntries, function(item) { return item.date.split('T')[0] + '-' + (['performed','skipped'].indexOf(item.entry) ? '1' : '0'); });
            logEntries.reverse();

            logEntries = logEntries.slice(0, this.state.maxReturn);

            /**
             * Inline Styles
             */
            var headerStyle = {
                padding: '2px 2px 0 8px',
                fontWeight: 'bold',
                fontSize: '1.5em',
                color: '#e2ff63',
                backgroundColor: '#444'
            };

            var buttonStyle = {
                paddingTop: '3px',
                paddingBottom: '3px',
                backgroundImage: 'none',
                color: '#444',
                backgroundColor: '#e2ff63',
                borderColor: '#e2ff63',
                fontWeight: 'bold',
                outlineColor: 'rgb(40, 40, 40)'
            };

            // html
            return (
                <div style={{ marginTop: '5px' }}>
                    <div style={headerStyle}>
                        <span>Recent Activity</span>
                        <button type="button" style={buttonStyle} className="btn pull-right" onClick={this.handleLogEntryClick}>Log a recent action</button>
                    </div>
                    <div className={this.props.hidden ? 'hidden' : ''} style={{ backgroundColor: '#444' }}>
                        {logEntries.map(
                            function(item) {
                                return (<LogEntryBox key={item.id} data={item} />);
                            }.bind(this)
                        )}
                    </div>
                </div>
            );
        }
    });
 }));
