(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('those')
    );
}(function (React, those) {
    var LogEntries = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        getInitialState: function () {
            return {
                maxReturn: 5,
                connectionsLastUpdated: new Date().toISOString()
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            logEntryStore.subscribe(this.handleLogEntryStoreUpdate);
            this.handleLogEntryStoreUpdate(logEntryStore.updates.value);
            var me = this;
            $(window).scroll(function() {
               if($(window).scrollTop() + $(window).height() == $(document).height()) {
                   me.setState({ maxReturn: me.state.maxReturn + 5});
               }
            });
        },
        componentWillUnmount: function () {
            logEntryStore.dispose(this.handleLogEntryStoreUpdate);
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            ui.goBack();
        },
        handleLogEntryStoreUpdate: function (connections) {
            this.setState({logEntriesLastUpdated: new Date().toISOString()});
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var userName = this.props.userName;

            // find log entries for this user
            var logEntries = those(logEntryStore.updates.value).like({userName: userName});
            logEntries = those(logEntries).order(function (item) { return item.date.split('T')[0] + '-' + (['performed','skipped'].indexOf(item.entry) > -1 ? '1' : '0')});
            logEntries.reverse();
            logEntries = those(logEntries).top(this.state.maxReturn);

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

            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>{userName}</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div className={this.props.hidden ? 'hidden' : ''} style={{ backgroundColor: '#444', padding: '5px' }}>
                        {logEntries.map(
                            function(item) {
                                return (<LogEntryBox data={item} />);
                            }.bind(this)
                        )}
                    </div>
                </div>
            );
        }
    });
    return LogEntries;
}));
