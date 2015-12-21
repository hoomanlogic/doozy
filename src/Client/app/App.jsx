(function (factory) {
    module.exports = exports = factory(
        require('react'),
        require('stores/action-store')
    );
}(function (React, actionStore) {

    var initializeStores = function () {
        actionStore.init();
    };

    var DoozyApp = React.createClass({
        componentWillMount: function () {
            initializeStores();
            actionStore.create({ id: 1, name: 'some actoin' });
        },

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
