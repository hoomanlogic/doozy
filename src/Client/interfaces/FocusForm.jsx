(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('pages/ManageFocus'),
    );
}(function (React, ManageFocus) {

    var FocusFormInterface = React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <ManageFocus id={this.props.id} />
            );
        },
    });

    return FocusFormInterface;
}));
