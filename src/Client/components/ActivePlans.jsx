(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('hl-common-js/src/those'),
        require('stores/tag-store'),
        require('stores/plan-store'),
        require('mixins/StoresMixin')
    );
}(function (React, those, tagStore, planStore, StoresMixin) {
    var ActivePlans = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([tagStore, planStore])],

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

            // Get plans
            plans = planStore.context({}) ? (planStore.context({}).value ? planStore.context({}).value : []) : [];
            if (!plans.length) {
                return plans;
            }

            // If we have a focus, assigned, then filter
            var focusTag = this.props.focusTag;
            if (focusTag) {
                plans = those(plans).like({ focusId: focusTag.id });
            }

            return plans;
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            var activePlans = this.getActivePlans();
            if (!activePlans || !activePlans.length) {
                return null;
            }

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
