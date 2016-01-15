(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('pages/ManageAction'),
    );
}(function (React, ManageAction) {

    var ActionFormInterface = React.createClass({

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <ManageAction id={this.props.id} mode={this.props.mode || 'Add'} />
            );
        },
    });

    return ActionFormInterface;
}));
