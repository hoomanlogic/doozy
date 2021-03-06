(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('pages/ManagePlan'),
    );
}(function (React, ManagePlan) {

    var PlanFormInterface = React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <ManagePlan id={this.props.id} />
            );
        },
    });

    return PlanFormInterface;
}));
