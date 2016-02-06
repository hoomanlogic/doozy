(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('jquery'),
        require('lodash'),
        require('stores/host'),
        require('hl-common-js/src/those'),
        require('stores/logentry-store'),
        require('mixins/StoresMixin'),
        require('./LogEntryBox')
    );
}(function (React, $, _, host, those, logEntryStore, StoresMixin, LogEntryBox) {
    var RecentActivity = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([logEntryStore])],
        getInitialState: function () {
            return {
                maxReturn: 10,
                logEntriesLastUpdated: new Date().toISOString()
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            var me = this;
            $(window).scroll(function () {
                if (Math.abs(($(window).scrollTop() + $(window).height()) - $(document).height()) < 5) {
                    me.setState({ maxReturn: me.state.maxReturn + 10});
                }
            });
        },
        componentWillReceiveProps: function (nextProps) {
            // Reset the max return to 5
            // when the tag filter changes
            if (nextProps.tags &&
                nextProps.tags.length &&
                this.props.tags.length &&
                !those(nextProps.tags).hasAll(this.props.tags)) {
                this.setState({
                    maxReturn: 10
                });
            }
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleLogEntryClick: function () {
            host.go('/doozy/logentry/new');
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            
            if (!logEntryStore.context({}) || !logEntryStore.context({}).value) {
                return null;
            }

            var tags = this.props.tags || [];

            /**
             * Get all log entries, optionally filtering by tags
             */
            var logEntries = logEntryStore.context({}).value.slice();
            if (tags.length) {
                // Filter log entries
                logEntries = logEntries.filter( function (log) {
                    
                    var outerMatch = those(log.tags).first(function (logTag) {
                        
                        var innerMatch = those(tags).first(function (matchTag) {
                            return logTag.name === matchTag.name;
                        });
                        
                        // Found a matching tag?
                        return innerMatch !== null;
                    });
                    
                    return outerMatch !== null;
                });
            }

            // Sort in reverse chronological order
            logEntries = _.sortBy(logEntries, function (item) { return item.date.split('T')[0] + '-' + (['performed','skipped'].indexOf(item.entry) ? '1' : '0'); });
            logEntries.reverse();
            
            // Limit returned values
            logEntries = logEntries.slice(0, this.state.maxReturn);

            // html
            return (
                <div style={styles.container}>
                    <div style={styles.header}>
                        <span>Recent Activity</span>
                        <button type="button" style={styles.button} className="btn pull-right" onClick={this.handleLogEntryClick}>Log a recent action</button>
                    </div>
                    <div className={this.props.hidden ? 'hidden' : ''} style={{ backgroundColor: '#444' }}>
                        {logEntries.map(function (item) {
                            return (<LogEntryBox key={item.id} data={item} />);
                        })}
                    </div>
                </div>
            );
        }
    });

    /**
     * Inline Styles
     */
    var styles = {
        container: {
            marginTop: '5px'
        },
        header: {
            padding: '2px 2px 0 8px',
            fontWeight: 'bold',
            fontSize: '1.5em',
            color: '#e2ff63',
            backgroundColor: '#444'
        },
        button: {
            paddingTop: '3px',
            paddingBottom: '3px',
            backgroundImage: 'none',
            color: '#444',
            backgroundColor: '#e2ff63',
            borderColor: '#e2ff63',
            fontWeight: 'bold',
            outlineColor: 'rgb(40, 40, 40)'
        }
    };

    return RecentActivity;
}));
