(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('pages/ManageFocuses'),
    );
}(function (React, ManageFocuses) {

    var FocusesInterface = React.createClass({
        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            return (
                <ManageFocuses />
            );
        },
    });

    return FocusesInterface;
}));
