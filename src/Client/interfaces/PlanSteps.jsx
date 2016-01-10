(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('components/PlanSteps'),
    );
}(function (React, PlanSteps) {

    var PlanStepsInterface = React.createClass({
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
                <PlanSteps planId={this.props.planId} />
            );
        },
    });

    return PlanStepsInterface;
}));
