(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/FocusStore'),
        require('stores/PlanStore'),
        require('hl-common-js/src/those')
    );
}(function (React, focusStore, planStore, those) {
    var ActivePlans = React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handlePlanClick: function (plan) {
            ui.goTo('Plan View', {planId: plan.id});
        },

        /*************************************************************
         * RENDERING HELPERS
         *************************************************************/
        getActivePlans: function () {
            var focus, plans;
            var focusTag = this.props.focusTag ? this.props.focusTag.slice(1) : undefined;
            if (focusTag) {
                focus = those(focusStore.updates.value).first({tagName: focusTag});
            }

            if (!focus) {
                plans = planStore.updates.value;
            }
            else {
                plans = those(planStore.updates.value).like({ focusId: focus.id });
            }
            return plans;
        },
        
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var activePlans = this.getActivePlans();

            /**
             * Sort the plans name
             */
            activePlans = those(activePlans).order('name');

            /**
             * Return null if there are no active plans for this focus
             */
            if (activePlans.length === 0) {
                return null;
            }

            /**
             * Inline Styles
             */
            var headerStyle = {
                color: '#e2ff63',
                backgroundColor: '#444',
                padding: '2px 2px 0 8px',
                fontWeight: 'bold',
                fontSize: '1.5em',
                marginBottom: '5px'
            };

            var listItemStyle = {
                fontWeight: 'bold',
                fontSize: '2em',
                borderRadius: '5px',
                backgroundColor: '#333',
                color: '#fff',
                padding: '5px',
                margin: '0 0 5px 5px',
                display: 'inline'
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
                <div>
                    <div style={headerStyle}>
                        <div>Active Plans</div>
                    </div>
                    <div style={{marginBottom: '5px'}}>
                        {activePlans.map(function(item, index) {
                            return (
                                <div key={item.id} style={listItemStyle}>
                                    <span className="clickable" onClick={this.handlePlanClick.bind(null, item)}>{item.name}</span>
                                </div>
                            );
                        }.bind(this))}
                    </div>
                </div>
            );
        }
    });
    return ActivePlans;
 }));
