(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/host'),
        require('lodash'),
        require('stores/focus-store'),
        require('mixins/SubscriberMixin')
    );
}(function (React, host, _, focusStore, SubscriberMixin) {
    var ManageFocuses = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [SubscriberMixin(focusStore)],
        getDefaultProps: function () {
            return {
                globalSubscriberContext: true // SubscriberMixin behavior property
            };
        },

        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/
        componentWillMount: function () {
            host.setTitle('Focuses');
        },

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            host.go('/doozy');
        },
        handleFocusClick: function (focus) {
            host.go('/doozy/focus/' + focus.id);
        },
        
        render: function () {
            var ctxFocuses = focusStore.context({});
            if (!ctxFocuses || !ctxFocuses.value) {
                return <div>Loading...</div>;
            }

            /**
             * Sort the actions by completed and name
             */
            var focuses = _.sortBy(ctxFocuses.value, function (focus) {
                return focus.kind + '-' + focus.name.toLowerCase();
            });

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Focuses</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {focuses.map(function (item) {
                            return (
                                <div key={item.id} className="clickable" style={focusStyle} onClick={this.handleFocusClick.bind(null, item)}>
                                    <span>{item.name}</span>
                                </div>
                            );
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

    var focusStyle = {
        fontSize: 'large',
        padding: '5px',
        borderBottom: 'solid 1px #e0e0e0'
    };

    return ManageFocuses;
}));
