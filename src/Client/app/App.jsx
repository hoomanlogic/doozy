(function (factory) {
    module.exports = exports = factory(
        require('react')
    );
}(function (React) {

    var DoozyApp = React.createClass({
        render: function () {
            // let other components know what page we're on
            return (
                <div>
                    Doozy
                </div>
            );
        },
    });

    return DoozyApp;
}));
