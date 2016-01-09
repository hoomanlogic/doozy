(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('mixins/StoresMixin'),
        require('stores/FocusStore'),
        require('stores/PlanStore'),
        require('hl-common-js/src/those')
    );
}(function (React, StoresMixin, focusStore, planStore, those) {
    var ActivePlans = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([focusStore, planStore])],

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handlePlanClick: function (plan) {
            window.location.href = '/doozy/plansteps/' + plan.id;
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

            // html
            return (
                <div>
                    <div style={styles.header}>
                        <div>Active Plans</div>
                    </div>
                    <div style={styles.plansContainer}>
                        {activePlans.map(function (item) {
                            return (
                                <div key={item.id} style={styles.listItem}>
                                    <span className="clickable" onClick={this.handlePlanClick.bind(null, item)}>{item.name}</span>
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
    var styles = {
        header: {
            color: '#e2ff63',
            backgroundColor: '#444',
            padding: '2px 2px 0 8px',
            fontWeight: 'bold',
            fontSize: '1.5em',
            marginBottom: '5px'
        },
        plansContainer: {
            marginBottom: '5px'
        },
        listItem: {
            fontWeight: 'bold',
            fontSize: '2em',
            borderRadius: '5px',
            backgroundColor: '#333',
            color: '#fff',
            padding: '5px',
            margin: '0 0 5px 5px',
            display: 'inline'
        }
    };

    return ActivePlans;
}));
