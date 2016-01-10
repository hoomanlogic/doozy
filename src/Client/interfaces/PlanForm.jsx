(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/ActionStore'),
        require('stores/FocusStore'),
        require('stores/LogEntryStore'),
        require('stores/PlanStore'),
        require('stores/PlanStepStore'),
        require('stores/TagStore'),
        require('stores/TargetStore'),
        require('mixins/StoresMixin'),
        require('pages/ManagePlan'),
    );
}(function (React, actionStore, focusStore, logEntryStore, planStore, planStepStore, tagStore, targetStore, StoresMixin, ManagePlan) {

    var PlanFormInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore, focusStore, logEntryStore, planStore, planStepStore, tagStore, targetStore], true)],
        getInitialState: function () {
            return {
                currentFocus: null
            };
        },
        /*************************************************************
         * COMPONENT LIFECYCLE
         *************************************************************/

        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleFocusClick: function (item) {
            this.setState({ currentFocus: item.name === null ? undefined : item });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {

            if (!actionStore.updates.value) {
                return (<div>No results</div>);
            }

            // let other components know what page we're on
            var mode = this.props.mode || 'Add';
            var page = (<ManagePlan planId={this.props.planId} pisNew={this.props.isNew} />);

            return (
                <div>
                    {page}
                </div>
            );
        },
    });

    return PlanFormInterface;
}));
