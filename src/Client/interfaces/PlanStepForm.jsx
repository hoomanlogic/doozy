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
        require('pages/ManagePlanStep'),
    );
}(function (React, actionStore, focusStore, logEntryStore, planStore, planStepStore, tagStore, targetStore, StoresMixin, ManagePlanStep) {

    var PlanStepFormInterface = React.createClass({
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
            var page = (<ManagePlanStep planStepId={this.props.planStepId} planId={this.props.planId} parentId={this.props.parentId} isNew={this.props.isNew} />);

            return (
                <div>
                    {page}
                </div>
            );
        },
    });

    return PlanStepFormInterface;
}));
