(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/host'),
        require('components/FocusBar'),
        require('components/TimerBar'),
        require('pages/ManageActions'),
    );
}(function (React, host, FocusBar, TimerBar, ManageActions) {

    var ActionsInterface = React.createClass({
        /*************************************************************
         * EVENT HANDLING
         *************************************************************/
        handleFocusClick: function (item) {
            host.context.set({
                focus: item
            });
            this.setState({
                contextStoreLastUpdate: new Date().toISOString()
            });
        },

        /*************************************************************
         * RENDERING
         *************************************************************/
        render: function () {
            var context = host.context.get();
            return (
                <div>
                    <FocusBar currentFocus={context.focus || undefined}
                        handleFocusClick={this.handleFocusClick} />
                    <TimerBar />
                    <ManageActions focusTag={context.focus && context.focus.name !== 'nofocus' ? context.focus : undefined} />
                </div>
            );
        },
    });

    return ActionsInterface;
}));
