(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),

        require('pages/ManagePlanStep'),
    );
}(function (React, ManagePlanStep) {

    var PlanStepFormInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
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
            return (
                <ManagePlanStep planStepId={this.props.planStepId} planId={this.props.planId} parentId={this.props.parentId} isNew={this.props.isNew} />
            );
        },
    });

    return PlanStepFormInterface;
}));
