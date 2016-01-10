(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/plan-store'),
        require('mixins/SubscriberMixin')
    );
}(function (React, planStore, SubscriberMixin) {
    var ManagePlans = React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        mixins: [SubscriberMixin(planStore)],
        getDefaultProps: function () {
            return {
                globalSubscriberContext: true // SubscriberMixin behavior property
            };
        },
        
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleCloseClick: function () {
            window.location.href = '/doozy';
        },
        handlePlanClick: function (plan) {
            window.location.href = '/doozy/plansteps/' + plan.id;
        },
        handleEditPlanDetailsClick: function (plan) {
            window.location.href = '/doozy/plan/' + plan.id;
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var ctxPlans = planStore.context({});
            if (!ctxPlans || !ctxPlans.value) {
                return <div>Loading...</div>
            }
            
            /**
             * Sort the actions by completed and name
             */
            var plans = _.sortBy(ctxPlans.value, function (plan) {
                return plan.name.toLowerCase();
            });

            // html
            return (
                <div>
                    <div style={headerStyle}>
                        <div style={{flexGrow: '1'}}>Plans</div>
                        <div style={{paddingRight: '5px'}}><button type="button" className="close" onClick={this.handleCloseClick}><span aria-hidden="true">&times;</span></button></div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        {plans.map(function (item, index) {
                            return (
                                <div key={item.id} style={listItemStyle}>
                                    <div style={{flexGrow: '1'}}>
                                        <span className="clickable" onClick={this.handlePlanClick.bind(null, item)}>{item.name}</span>
                                    </div>
                                    <div>
                                        <button type="button" style={buttonStyle} className="btn" onClick={this.handleEditPlanDetailsClick.bind(null, item)}><i className="fa fa-pencil"></i></button>
                                    </div>
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

    var listItemStyle = {
        display: 'flex',
        flexDirection: 'row',
        fontSize: 'large',
        padding: '5px',
        borderBottom: 'solid 1px #e0e0e0'
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
    
    return ManagePlans;
 }));
