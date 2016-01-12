(function (factory) {
    require('./Actions.less');
    module.exports = exports = factory(
        require('react'),
        require('stores/host'),
        require('stores/ActionStore'),
        require('stores/TagStore'),
        require('mixins/StoresMixin'),
        require('components/FocusBar'),
        require('components/TimerBar'),
        require('pages/ManageActions'),
    );
}(function (React, host, actionStore, tagStore, StoresMixin, FocusBar, TimerBar, ManageActions) {

    var ActionsInterface = React.createClass({
        /*************************************************************
         * DEFINITIONS
         *************************************************************/
        mixins: [StoresMixin([actionStore, tagStore], true)],
        getInitialState: function () {
            return {
                currentFocus: null
            };
        },

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

            if (!actionStore.updates.value || !tagStore.updates.value) {
                return (<div>No results</div>);
            }
            
            var context = host.context.get();
            return (
                <div>
                    <FocusBar currentFocus={context.focus}
                        handleFocusClick={this.handleFocusClick} />
                    <TimerBar />
                    <ManageActions focusTag={context.focus ? '!' + context.focus.tagName : undefined} />
                </div>
            );
        },
    });

    return ActionsInterface;
}));
